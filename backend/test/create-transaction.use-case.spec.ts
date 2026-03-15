import { Prisma } from '@prisma/client';
import { CreateTransactionUseCase } from '../src/modules/transactions/application/use-cases/create-transaction.use-case';

describe('CreateTransactionUseCase', () => {
  it('creates an income transaction and increases the account balance', async () => {
    const tx = {
      account: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'account-1',
          userId: 'user-1',
          balance: new Prisma.Decimal(100)
        }),
        update: jest.fn().mockResolvedValue(undefined)
      },
      category: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'category-1',
          userId: null,
          kind: 'INCOME'
        })
      },
      transaction: {
        create: jest.fn().mockResolvedValue({
          id: 'txn-1',
          userId: 'user-1',
          accountId: 'account-1',
          categoryId: 'category-1',
          txnDate: new Date('2026-03-14T12:00:00Z'),
          amount: new Prisma.Decimal(25),
          type: 'INCOME',
          description: 'Pago',
          notes: null,
          isRecurring: false,
          attachmentCount: 0,
          transferAccountId: null,
          linkedTransactionId: null,
          createdAt: new Date('2026-03-14T12:00:00Z'),
          updatedAt: new Date('2026-03-14T12:00:00Z')
        })
      }
    };

    const prismaService = {
      $transaction: jest.fn().mockImplementation(async (callback) => callback(tx))
    };

    const useCase = new CreateTransactionUseCase(prismaService as never);

    await expect(
      useCase.execute(
        { id: 'user-1', email: 'user@example.com' },
        {
          accountId: 'account-1',
          categoryId: 'category-1',
          txnDate: new Date('2026-03-14T12:00:00Z'),
          amount: 25,
          type: 'INCOME',
          description: 'Pago'
        }
      )
    ).resolves.toMatchObject({
      id: 'txn-1',
      amount: '25.00',
      type: 'INCOME'
    });
    expect(tx.account.update).toHaveBeenCalledWith({
      where: { id: 'account-1' },
      data: {
        balance: new Prisma.Decimal(100).plus(25)
      }
    });
  });

  it('rejects categories that do not match the transaction type', async () => {
    const tx = {
      account: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'account-1',
          userId: 'user-1',
          balance: new Prisma.Decimal(100)
        })
      },
      category: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'category-1',
          userId: null,
          kind: 'EXPENSE'
        })
      }
    };

    const prismaService = {
      $transaction: jest.fn().mockImplementation(async (callback) => callback(tx))
    };

    const useCase = new CreateTransactionUseCase(prismaService as never);

    await expect(
      useCase.execute(
        { id: 'user-1', email: 'user@example.com' },
        {
          accountId: 'account-1',
          categoryId: 'category-1',
          txnDate: new Date('2026-03-14T12:00:00Z'),
          amount: 25,
          type: 'INCOME'
        }
      )
    ).rejects.toThrow('La categoria no corresponde al tipo de transaccion.');
  });

  it('transfers between user accounts and updates both balances', async () => {
    const tx = {
      account: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce({
            id: 'account-1',
            userId: 'user-1',
            balance: new Prisma.Decimal(200)
          })
          .mockResolvedValueOnce({
            id: 'account-2',
            userId: 'user-1',
            balance: new Prisma.Decimal(50)
          }),
        update: jest.fn().mockResolvedValue(undefined)
      },
      category: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'category-1',
          userId: null,
          kind: 'EXPENSE'
        })
      },
      transaction: {
        create: jest
          .fn()
          .mockResolvedValueOnce({
            id: 'txn-2-source',
            userId: 'user-1',
            accountId: 'account-1',
            categoryId: 'category-1',
            txnDate: new Date('2026-03-14T12:00:00Z'),
            amount: new Prisma.Decimal(40),
            type: 'TRANSFER',
            description: null,
            notes: null,
            isRecurring: false,
            attachmentCount: 0,
            transferAccountId: 'account-2',
            linkedTransactionId: null,
            createdAt: new Date('2026-03-14T12:00:00Z'),
            updatedAt: new Date('2026-03-14T12:00:00Z')
          })
          .mockResolvedValueOnce({
            id: 'txn-2-destination',
            userId: 'user-1',
            accountId: 'account-2',
            categoryId: 'category-1',
            txnDate: new Date('2026-03-14T12:00:00Z'),
            amount: new Prisma.Decimal(40),
            type: 'TRANSFER',
            description: null,
            notes: null,
            isRecurring: false,
            attachmentCount: 0,
            transferAccountId: 'account-1',
            linkedTransactionId: 'txn-2-source',
            createdAt: new Date('2026-03-14T12:00:00Z'),
            updatedAt: new Date('2026-03-14T12:00:00Z')
          }),
        update: jest.fn().mockResolvedValue({
          id: 'txn-2-source',
          userId: 'user-1',
          accountId: 'account-1',
          categoryId: 'category-1',
          txnDate: new Date('2026-03-14T12:00:00Z'),
          amount: new Prisma.Decimal(40),
          type: 'TRANSFER',
          description: null,
          notes: null,
          isRecurring: false,
          attachmentCount: 0,
          transferAccountId: 'account-2',
          linkedTransactionId: 'txn-2-destination',
          createdAt: new Date('2026-03-14T12:00:00Z'),
          updatedAt: new Date('2026-03-14T12:00:00Z')
        })
      }
    };

    const prismaService = {
      $transaction: jest.fn().mockImplementation(async (callback) => callback(tx))
    };

    const useCase = new CreateTransactionUseCase(prismaService as never);

    await expect(
      useCase.execute(
        { id: 'user-1', email: 'user@example.com' },
        {
          accountId: 'account-1',
          categoryId: 'category-1',
          txnDate: new Date('2026-03-14T12:00:00Z'),
          amount: 40,
          type: 'TRANSFER',
          transferAccountId: 'account-2'
        }
      )
    ).resolves.toMatchObject({
      id: 'txn-2-source',
      type: 'TRANSFER',
      transferAccountId: 'account-2',
      linkedTransactionId: 'txn-2-destination'
    });
    expect(tx.account.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'account-1' },
      data: {
        balance: new Prisma.Decimal(200).minus(40)
      }
    });
    expect(tx.account.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'account-2' },
      data: {
        balance: new Prisma.Decimal(50).plus(40)
      }
    });
    expect(tx.transaction.create).toHaveBeenNthCalledWith(1, {
      data: {
        userId: 'user-1',
        accountId: 'account-1',
        categoryId: 'category-1',
        txnDate: new Date('2026-03-14T12:00:00Z'),
        amount: new Prisma.Decimal(40),
        type: 'TRANSFER',
        description: null,
        notes: null,
        transferAccountId: 'account-2'
      }
    });
    expect(tx.transaction.create).toHaveBeenNthCalledWith(2, {
      data: {
        userId: 'user-1',
        accountId: 'account-2',
        categoryId: 'category-1',
        txnDate: new Date('2026-03-14T12:00:00Z'),
        amount: new Prisma.Decimal(40),
        type: 'TRANSFER',
        description: null,
        notes: null,
        transferAccountId: 'account-1',
        linkedTransactionId: 'txn-2-source'
      }
    });
    expect(tx.transaction.update).toHaveBeenCalledWith({
      where: {
        id: 'txn-2-source'
      },
      data: {
        linkedTransactionId: 'txn-2-destination'
      }
    });
  });
});
