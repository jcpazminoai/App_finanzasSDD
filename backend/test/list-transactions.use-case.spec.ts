import { Prisma } from '@prisma/client';
import { ListTransactionsUseCase } from '../src/modules/transactions/application/use-cases/list-transactions.use-case';

describe('ListTransactionsUseCase', () => {
  it('lists transactions applying user scope and filters', async () => {
    const prismaService = {
      transaction: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'txn-1',
            userId: 'user-1',
            accountId: 'account-1',
            categoryId: 'category-1',
            txnDate: new Date('2026-03-14T12:00:00Z'),
            amount: new Prisma.Decimal(80),
            type: 'EXPENSE',
            description: 'Mercado',
            notes: null,
            isRecurring: false,
            attachmentCount: 0,
            transferAccountId: null,
            linkedTransactionId: null,
            createdAt: new Date('2026-03-14T12:00:00Z'),
            updatedAt: new Date('2026-03-14T12:00:00Z')
          }
        ])
      }
    };

    const useCase = new ListTransactionsUseCase(prismaService as never);

    await expect(
      useCase.execute(
        { id: 'user-1', email: 'user@example.com' },
        {
          accountId: 'account-1',
          categoryId: 'category-1',
          type: 'EXPENSE',
          from: new Date('2026-03-01T00:00:00Z'),
          to: new Date('2026-03-31T23:59:59Z')
        }
      )
    ).resolves.toEqual([
      {
        id: 'txn-1',
        userId: 'user-1',
        accountId: 'account-1',
        categoryId: 'category-1',
        txnDate: new Date('2026-03-14T12:00:00Z'),
        amount: '80.00',
        type: 'EXPENSE',
        description: 'Mercado',
        notes: null,
        isRecurring: false,
        attachmentCount: 0,
        transferAccountId: null,
        linkedTransactionId: null,
        createdAt: new Date('2026-03-14T12:00:00Z'),
        updatedAt: new Date('2026-03-14T12:00:00Z')
      }
    ]);
    expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        deletedAt: null,
        categoryId: 'category-1',
        accountId: 'account-1',
        type: 'EXPENSE',
        txnDate: {
          gte: new Date('2026-03-01T00:00:00Z'),
          lte: new Date('2026-03-31T23:59:59Z')
        }
      },
      orderBy: [{ txnDate: 'desc' }, { createdAt: 'desc' }]
    });
  });
});
