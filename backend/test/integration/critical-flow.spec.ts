import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AddressInfo } from 'net';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/infrastructure/prisma/prisma.service';

describe('Critical flow integration', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true
      })
    );

    await app.listen(0);

    const address = app.getHttpServer().address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}/graphql`;
    prismaService = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prismaService.$executeRawUnsafe(
      [
        'TRUNCATE TABLE',
        'user_sessions,',
        'transactions,',
        'accounts,',
        'categories,',
        'users',
        'RESTART IDENTITY CASCADE;'
      ].join(' ')
    );

    await prismaService.$executeRawUnsafe(
      [
        'INSERT INTO categories ("id", "user_id", "name", "kind", "icon", "is_builtin", "created_at", "updated_at")',
        'VALUES',
        "(gen_random_uuid()::text, NULL, 'Salario', 'INCOME', 'salary', true, NOW(), NOW()),",
        "(gen_random_uuid()::text, NULL, 'Alimentacion', 'EXPENSE', 'food', true, NOW(), NOW())"
      ].join(' ')
    );
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('runs the full MVP backend flow against the test database', async () => {
    const email = `integration-${Date.now()}@example.com`;

    const registerResponse = await executeGraphql(baseUrl, {
      query: `
        mutation Register($input: RegisterUserInput!) {
          register(input: $input) {
            accessToken
            user {
              id
              email
            }
          }
        }
      `,
      variables: {
        input: {
          name: 'Usuario Integracion',
          email,
          password: 'ClaveSegura123'
        }
      }
    });

    expect(registerResponse.errors).toBeUndefined();
    const accessToken = registerResponse.data.register.accessToken as string;
    const userId = registerResponse.data.register.user.id as string;

    const currentUserResponse = await executeGraphql(
      baseUrl,
      {
        query: `
          query CurrentUser {
            currentUser {
              id
              email
            }
          }
        `
      },
      accessToken
    );

    expect(currentUserResponse.data.currentUser).toEqual({
      id: userId,
      email
    });

    const createAccountResponse = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateAccount($input: CreateAccountInput!) {
            createAccount(input: $input) {
              id
              balance
            }
          }
        `,
        variables: {
          input: {
            name: 'Cuenta principal',
            type: 'BANK',
            currency: 'USD',
            initialBalance: 1000
          }
        }
      },
      accessToken
    );

    const accountId = createAccountResponse.data.createAccount.id as string;

    const createCategoryResponse = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateCategory($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              id
              kind
            }
          }
        `,
        variables: {
          input: {
            name: 'Freelance',
            kind: 'INCOME',
            icon: 'briefcase'
          }
        }
      },
      accessToken
    );

    const incomeCategoryId = createCategoryResponse.data.createCategory.id as string;

    const createIncomeResponse = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateTransaction($input: CreateTransactionInput!) {
            createTransaction(input: $input) {
              id
              amount
              type
            }
          }
        `,
        variables: {
          input: {
            accountId,
            categoryId: incomeCategoryId,
            txnDate: '2026-03-14T12:00:00.000Z',
            amount: 500,
            type: 'INCOME',
            description: 'Pago freelance'
          }
        }
      },
      accessToken
    );

    expect(createIncomeResponse.data.createTransaction).toMatchObject({
      amount: '500.00',
      type: 'INCOME'
    });

    const builtinExpenseCategory = await prismaService.category.findFirstOrThrow({
      where: {
        userId: null,
        kind: 'EXPENSE',
        name: 'Alimentacion'
      }
    });

    await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateTransaction($input: CreateTransactionInput!) {
            createTransaction(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            accountId,
            categoryId: builtinExpenseCategory.id,
            txnDate: '2026-03-15T12:00:00.000Z',
            amount: 120,
            type: 'EXPENSE',
            description: 'Mercado'
          }
        }
      },
      accessToken
    );

    const accountsResponse = await executeGraphql(
      baseUrl,
      {
        query: `
          query Accounts {
            accounts {
              id
              balance
            }
          }
        `
      },
      accessToken
    );

    expect(accountsResponse.data.accounts).toEqual([
      {
        id: accountId,
        balance: '1380.00'
      }
    ]);

    const transactionsResponse = await executeGraphql(
      baseUrl,
      {
        query: `
          query Transactions {
            transactions {
              type
              amount
            }
          }
        `
      },
      accessToken
    );

    expect(transactionsResponse.data.transactions).toHaveLength(2);

    const summaryResponse = await executeGraphql(
      baseUrl,
      {
        query: `
          query MonthlySummary($input: MonthlySummaryInput!) {
            monthlySummary(input: $input) {
              year
              month
              income
              expense
              balance
            }
          }
        `,
        variables: {
          input: {
            year: 2026,
            month: 3
          }
        }
      },
      accessToken
    );

    expect(summaryResponse.data.monthlySummary).toEqual({
      year: 2026,
      month: 3,
      income: '500.00',
      expense: '120.00',
      balance: '380.00'
    });
  });

  it('rejects protected queries without token', async () => {
    const response = await executeGraphql(baseUrl, {
      query: `
        query CurrentUser {
          currentUser {
            id
          }
        }
      `
    });

    expect(response.data).toBeNull();
    expect(response.errors?.[0]?.message).toContain(
      'Token de acceso requerido.'
    );
  });

  it('rejects creating a transaction against another user account', async () => {
    const firstUser = await registerAndLogin(baseUrl, 'owner@example.com');
    const secondUser = await registerAndLogin(baseUrl, 'intruder@example.com');

    const accountResponse = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateAccount($input: CreateAccountInput!) {
            createAccount(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            name: 'Cuenta privada',
            type: 'BANK',
            currency: 'USD',
            initialBalance: 100
          }
        }
      },
      firstUser.accessToken
    );

    const customIncomeCategory = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateCategory($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            name: 'Servicios',
            kind: 'INCOME'
          }
        }
      },
      secondUser.accessToken
    );

    const forbiddenTransaction = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateTransaction($input: CreateTransactionInput!) {
            createTransaction(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            accountId: accountResponse.data.createAccount.id,
            categoryId: customIncomeCategory.data.createCategory.id,
            txnDate: '2026-03-20T12:00:00.000Z',
            amount: 50,
            type: 'INCOME'
          }
        }
      },
      secondUser.accessToken
    );

    expect(forbiddenTransaction.data).toBeNull();
    expect(forbiddenTransaction.errors?.[0]?.message).toContain(
      'La cuenta seleccionada no existe o no pertenece al usuario.'
    );
  });

  it('stores transfers as two linked transactions and excludes them from global monthly summary', async () => {
    const user = await registerAndLogin(baseUrl, 'transfer-user@example.com');

    const sourceAccountResponse = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateAccount($input: CreateAccountInput!) {
            createAccount(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            name: 'Cuenta origen',
            type: 'BANK',
            currency: 'USD',
            initialBalance: 1000
          }
        }
      },
      user.accessToken
    );

    const destinationAccountResponse = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateAccount($input: CreateAccountInput!) {
            createAccount(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            name: 'Cuenta destino',
            type: 'BANK',
            currency: 'USD',
            initialBalance: 250
          }
        }
      },
      user.accessToken
    );

    const transferCategory = await prismaService.category.findFirstOrThrow({
      where: {
        userId: null,
        kind: 'EXPENSE',
        name: 'Alimentacion'
      }
    });

    const transferResponse = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateTransaction($input: CreateTransactionInput!) {
            createTransaction(input: $input) {
              id
              type
              accountId
              transferAccountId
              linkedTransactionId
            }
          }
        `,
        variables: {
          input: {
            accountId: sourceAccountResponse.data.createAccount.id,
            categoryId: transferCategory.id,
            txnDate: '2026-03-18T12:00:00.000Z',
            amount: 200,
            type: 'TRANSFER',
            transferAccountId: destinationAccountResponse.data.createAccount.id,
            description: 'Mover fondos'
          }
        }
      },
      user.accessToken
    );

    expect(transferResponse.errors).toBeUndefined();
    expect(transferResponse.data.createTransaction.type).toBe('TRANSFER');
    expect(transferResponse.data.createTransaction.linkedTransactionId).toBeTruthy();

    const transactionsResponse = await executeGraphql(
      baseUrl,
      {
        query: `
          query Transactions {
            transactions {
              id
              type
              accountId
              transferAccountId
              linkedTransactionId
            }
          }
        `
      },
      user.accessToken
    );

    expect(transactionsResponse.data.transactions).toHaveLength(2);

    const firstLeg = transactionsResponse.data.transactions.find(
      (transaction: { id: string }) =>
        transaction.id === transferResponse.data.createTransaction.id
    );
    const secondLeg = transactionsResponse.data.transactions.find(
      (transaction: { id: string }) =>
        transaction.id === transferResponse.data.createTransaction.linkedTransactionId
    );

    expect(firstLeg).toMatchObject({
      type: 'TRANSFER',
      accountId: sourceAccountResponse.data.createAccount.id,
      transferAccountId: destinationAccountResponse.data.createAccount.id,
      linkedTransactionId: secondLeg.id
    });
    expect(secondLeg).toMatchObject({
      type: 'TRANSFER',
      accountId: destinationAccountResponse.data.createAccount.id,
      transferAccountId: sourceAccountResponse.data.createAccount.id,
      linkedTransactionId: firstLeg.id
    });

    const accountsResponse = await executeGraphql(
      baseUrl,
      {
        query: `
          query Accounts {
            accounts {
              id
              balance
            }
          }
        `
      },
      user.accessToken
    );

    expect(accountsResponse.data.accounts).toEqual([
      {
        id: sourceAccountResponse.data.createAccount.id,
        balance: '800.00'
      },
      {
        id: destinationAccountResponse.data.createAccount.id,
        balance: '450.00'
      }
    ]);

    const summaryResponse = await executeGraphql(
      baseUrl,
      {
        query: `
          query MonthlySummary($input: MonthlySummaryInput!) {
            monthlySummary(input: $input) {
              income
              expense
              balance
              byCategory {
                categoryId
              }
            }
          }
        `,
        variables: {
          input: {
            year: 2026,
            month: 3
          }
        }
      },
      user.accessToken
    );

    expect(summaryResponse.data.monthlySummary).toEqual({
      income: '0.00',
      expense: '0.00',
      balance: '0.00',
      byCategory: []
    });
  });

  it('updates and archives accounts and reflects the archived flag in account listing', async () => {
    const user = await registerAndLogin(baseUrl, 'accounts-crud@example.com');

    const created = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateAccount($input: CreateAccountInput!) {
            createAccount(input: $input) {
              id
              name
              isArchived
            }
          }
        `,
        variables: {
          input: {
            name: 'Cuenta editable',
            type: 'BANK',
            currency: 'USD',
            initialBalance: 75
          }
        }
      },
      user.accessToken
    );

    const updated = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation UpdateAccount($input: UpdateAccountInput!) {
            updateAccount(input: $input) {
              id
              name
              type
              currency
            }
          }
        `,
        variables: {
          input: {
            id: created.data.createAccount.id,
            name: 'Cuenta archivada',
            type: 'CASH',
            currency: 'eur'
          }
        }
      },
      user.accessToken
    );

    expect(updated.data.updateAccount).toEqual({
      id: created.data.createAccount.id,
      name: 'Cuenta archivada',
      type: 'CASH',
      currency: 'EUR'
    });

    const archived = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation ArchiveAccount($accountId: String!) {
            archiveAccount(accountId: $accountId) {
              id
              isArchived
            }
          }
        `,
        variables: {
          accountId: created.data.createAccount.id
        }
      },
      user.accessToken
    );

    expect(archived.data.archiveAccount).toEqual({
      id: created.data.createAccount.id,
      isArchived: true
    });

    const accounts = await executeGraphql(
      baseUrl,
      {
        query: `
          query Accounts {
            accounts {
              id
              isArchived
            }
          }
        `
      },
      user.accessToken
    );

    expect(accounts.data.accounts).toEqual([
      {
        id: created.data.createAccount.id,
        isArchived: true
      }
    ]);
  });

  it('updates and deletes custom categories and rejects deleting categories with dependent transactions', async () => {
    const user = await registerAndLogin(baseUrl, 'categories-crud@example.com');

    const createdCategory = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateCategory($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            name: 'Categoria temporal',
            kind: 'EXPENSE'
          }
        }
      },
      user.accessToken
    );

    const updatedCategory = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation UpdateCategory($input: UpdateCategoryInput!) {
            updateCategory(input: $input) {
              id
              name
              kind
              icon
            }
          }
        `,
        variables: {
          input: {
            id: createdCategory.data.createCategory.id,
            name: 'Categoria final',
            kind: 'INCOME',
            icon: 'star'
          }
        }
      },
      user.accessToken
    );

    expect(updatedCategory.data.updateCategory).toEqual({
      id: createdCategory.data.createCategory.id,
      name: 'Categoria final',
      kind: 'INCOME',
      icon: 'star'
    });

    const deletedCategory = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation DeleteCategory($categoryId: String!) {
            deleteCategory(categoryId: $categoryId)
          }
        `,
        variables: {
          categoryId: createdCategory.data.createCategory.id
        }
      },
      user.accessToken
    );

    expect(deletedCategory.data.deleteCategory).toBe(true);

    const account = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateAccount($input: CreateAccountInput!) {
            createAccount(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            name: 'Cuenta para categoria',
            type: 'BANK',
            currency: 'USD',
            initialBalance: 100
          }
        }
      },
      user.accessToken
    );

    const categoryInUse = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateCategory($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            name: 'Categoria en uso',
            kind: 'EXPENSE'
          }
        }
      },
      user.accessToken
    );

    await executeGraphql(
      baseUrl,
      {
        query: `
          mutation CreateTransaction($input: CreateTransactionInput!) {
            createTransaction(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            accountId: account.data.createAccount.id,
            categoryId: categoryInUse.data.createCategory.id,
            txnDate: '2026-03-22T12:00:00.000Z',
            amount: 20,
            type: 'EXPENSE'
          }
        }
      },
      user.accessToken
    );

    const deleteInUse = await executeGraphql(
      baseUrl,
      {
        query: `
          mutation DeleteCategory($categoryId: String!) {
            deleteCategory(categoryId: $categoryId)
          }
        `,
        variables: {
          categoryId: categoryInUse.data.createCategory.id
        }
      },
      user.accessToken
    );

    expect(deleteInUse.data).toBeNull();
    expect(deleteInUse.errors?.[0]?.message).toContain(
      'No se puede eliminar una categoria con movimientos o presupuestos asociados.'
    );
  });
});

async function registerAndLogin(
  url: string,
  email: string
): Promise<{ accessToken: string; userId: string }> {
  const response = await executeGraphql(url, {
    query: `
      mutation Register($input: RegisterUserInput!) {
        register(input: $input) {
          accessToken
          user {
            id
          }
        }
      }
    `,
    variables: {
      input: {
        name: 'Usuario Test',
        email,
        password: 'ClaveSegura123'
      }
    }
  });

  return {
    accessToken: response.data.register.accessToken as string,
    userId: response.data.register.user.id as string
  };
}

async function executeGraphql(
  url: string,
  body: Record<string, unknown>,
  accessToken?: string
): Promise<any> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(accessToken
        ? {
            authorization: `Bearer ${accessToken}`
          }
        : {})
    },
    body: JSON.stringify(body)
  });

  return response.json();
}
