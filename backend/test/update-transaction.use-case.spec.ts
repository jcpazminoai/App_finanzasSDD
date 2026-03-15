import { Prisma } from '@prisma/client';
import { UpdateTransactionUseCase } from '../src/modules/transactions/application/use-cases/update-transaction.use-case';

describe('UpdateTransactionUseCase', () => {
  it('updates a regular transaction, reverts the old balance and applies the new one', async () => {
    const tx = {
      transaction: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'txn-1',
          userId: 'user-1',
          accountId: 'account-1',
          categoryId: 'category-expense',
          txnDate: new Date('2026-03-14T12:00:00Z'),
          amount: new Prisma.Decimal(50),
          type: 'EXPENSE',
          description: 'Mercado',
          notes: null,
          isRecurring: false,
          attachmentCount: 0,
          transferAccountId: null,
          linkedTransactionId: null,
          createdAt: new Date('2026-03-14T12:00:00Z'),
          updatedAt: new Date('2026-03-14T12:00:00Z'),
          deletedAt: null
        }),
        update: jest.fn().mockResolvedValue({
          id: 'txn-1',
          userId: 'user-1',
          accountId: 'account-2',
          categoryId: 'category-income',
          txnDate: new Date('2026-03-15T12:00:00Z'),
          amount: new Prisma.Decimal(80),
          type: 'INCOME',
          description: 'Ajuste',
          notes: null,
          isRecurring: false,
          attachmentCount: 0,
          transferAccountId: null,
          linkedTransactionId: null,
          createdAt: new Date('2026-03-14T12:00:00Z'),
          updatedAt: new Date('2026-03-15T12:00:00Z')
        })
      },
      account: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce({
            id: 'account-1',
            userId: 'user-1',
            balance: new Prisma.Decimal(150)
          })
          .mockResolvedValueOnce({
            id: 'account-2',
            userId: 'user-1',
            balance: new Prisma.Decimal(20)
          }),
        update: jest.fn().mockResolvedValue(undefined)
      },
      category: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'category-income',
          userId: null,
          kind: 'INCOME'
        })
      }
    };

    const prismaService = {
      $transaction: jest.fn().mockImplementation(async (callback) => callback(tx))
    };

    const useCase = new UpdateTransactionUseCase(prismaService as never);

    await expect(
      useCase.execute(
        { id: 'user-1', email: 'user@example.com' },
        {
          id: 'txn-1',
          accountId: 'account-2',
          categoryId: 'category-income',
          txnDate: new Date('2026-03-15T12:00:00Z'),
          amount: 80,
          type: 'INCOME',
          description: 'Ajuste'
        }
      )
    ).resolves.toMatchObject({
      id: 'txn-1',
      type: 'INCOME',
      amount: '80.00',
      accountId: 'account-2'
    });

    expect(tx.account.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'account-1' },
      data: {
        balance: new Prisma.Decimal(150).plus(50)
      }
    });
    expect(tx.account.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'account-2' },
      data: {
        balance: new Prisma.Decimal(20).plus(80)
      }
    });
  });

  it('updates a transfer using its canonical direction and adjusts both balances', async () => {
    const selectedDestination = {
      id: 'txn-destination',
      userId: 'user-1',
      accountId: 'account-2',
      categoryId: 'category-transfer',
      txnDate: new Date('2026-03-14T12:00:00Z'),
      amount: new Prisma.Decimal(40),
      type: 'TRANSFER',
      description: 'Mover',
      notes: null,
      isRecurring: false,
      attachmentCount: 0,
      transferAccountId: 'account-1',
      linkedTransactionId: 'txn-source',
      createdAt: new Date('2026-03-14T12:00:00Z'),
      updatedAt: new Date('2026-03-14T12:00:01Z'),
      deletedAt: null
    };
    const canonicalSource = {
      id: 'txn-source',
      userId: 'user-1',
      accountId: 'account-1',
      categoryId: 'category-transfer',
      txnDate: new Date('2026-03-14T12:00:00Z'),
      amount: new Prisma.Decimal(40),
      type: 'TRANSFER',
      description: 'Mover',
      notes: null,
      isRecurring: false,
      attachmentCount: 0,
      transferAccountId: 'account-2',
      linkedTransactionId: 'txn-destination',
      createdAt: new Date('2026-03-14T12:00:00Z'),
      updatedAt: new Date('2026-03-14T12:00:02Z'),
      deletedAt: null
    };

    const tx = {
      transaction: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce(selectedDestination)
          .mockResolvedValueOnce(canonicalSource),
        update: jest
          .fn()
          .mockResolvedValueOnce({
            ...selectedDestination,
            amount: new Prisma.Decimal(60),
            linkedTransactionId: 'txn-source',
            updatedAt: new Date('2026-03-14T12:05:00Z')
          })
          .mockResolvedValueOnce({
            ...canonicalSource,
            amount: new Prisma.Decimal(60),
            linkedTransactionId: 'txn-destination',
            updatedAt: new Date('2026-03-14T12:05:01Z')
          })
      },
      account: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce({
            id: 'account-1',
            userId: 'user-1',
            balance: new Prisma.Decimal(160)
          })
          .mockResolvedValueOnce({
            id: 'account-2',
            userId: 'user-1',
            balance: new Prisma.Decimal(90)
          })
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
          id: 'category-transfer',
          userId: null,
          kind: 'EXPENSE'
        })
      }
    };

    const prismaService = {
      $transaction: jest.fn().mockImplementation(async (callback) => callback(tx))
    };

    const useCase = new UpdateTransactionUseCase(prismaService as never);

    await expect(
      useCase.execute(
        { id: 'user-1', email: 'user@example.com' },
        {
          id: 'txn-destination',
          amount: 60
        }
      )
    ).resolves.toMatchObject({
      id: 'txn-source',
      type: 'TRANSFER',
      amount: '60.00',
      transferAccountId: 'account-2'
    });

    expect(tx.account.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'account-1' },
      data: {
        balance: new Prisma.Decimal(160).plus(40)
      }
    });
    expect(tx.account.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'account-2' },
      data: {
        balance: new Prisma.Decimal(90).minus(40)
      }
    });
    expect(tx.account.update).toHaveBeenNthCalledWith(3, {
      where: { id: 'account-1' },
      data: {
        balance: new Prisma.Decimal(200).minus(60)
      }
    });
    expect(tx.account.update).toHaveBeenNthCalledWith(4, {
      where: { id: 'account-2' },
      data: {
        balance: new Prisma.Decimal(50).plus(60)
      }
    });
  });
});
