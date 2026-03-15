import { Prisma } from '@prisma/client';
import { DeleteTransactionUseCase } from '../src/modules/transactions/application/use-cases/delete-transaction.use-case';

describe('DeleteTransactionUseCase', () => {
  it('deletes a regular expense and restores the account balance', async () => {
    const tx = {
      transaction: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'txn-1',
          userId: 'user-1',
          accountId: 'account-1',
          categoryId: 'category-1',
          txnDate: new Date('2026-03-14T12:00:00Z'),
          amount: new Prisma.Decimal(25),
          type: 'EXPENSE',
          description: 'Cafe',
          notes: null,
          isRecurring: false,
          attachmentCount: 0,
          transferAccountId: null,
          linkedTransactionId: null,
          createdAt: new Date('2026-03-14T12:00:00Z'),
          updatedAt: new Date('2026-03-14T12:00:00Z'),
          deletedAt: null
        }),
        delete: jest.fn().mockResolvedValue(undefined)
      },
      account: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'account-1',
          userId: 'user-1',
          balance: new Prisma.Decimal(175)
        }),
        update: jest.fn().mockResolvedValue(undefined)
      }
    };

    const prismaService = {
      $transaction: jest.fn().mockImplementation(async (callback) => callback(tx))
    };

    const useCase = new DeleteTransactionUseCase(prismaService as never);

    await expect(
      useCase.execute({ id: 'user-1', email: 'user@example.com' }, 'txn-1')
    ).resolves.toBe(true);

    expect(tx.account.update).toHaveBeenCalledWith({
      where: { id: 'account-1' },
      data: {
        balance: new Prisma.Decimal(175).plus(25)
      }
    });
    expect(tx.transaction.delete).toHaveBeenCalledWith({
      where: { id: 'txn-1' }
    });
  });

  it('deletes a transfer from any linked row and restores both balances', async () => {
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
        delete: jest.fn().mockResolvedValue(undefined)
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
          }),
        update: jest.fn().mockResolvedValue(undefined)
      }
    };

    const prismaService = {
      $transaction: jest.fn().mockImplementation(async (callback) => callback(tx))
    };

    const useCase = new DeleteTransactionUseCase(prismaService as never);

    await expect(
      useCase.execute(
        { id: 'user-1', email: 'user@example.com' },
        'txn-destination'
      )
    ).resolves.toBe(true);

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
    expect(tx.transaction.delete).toHaveBeenNthCalledWith(1, {
      where: { id: 'txn-source' }
    });
    expect(tx.transaction.delete).toHaveBeenNthCalledWith(2, {
      where: { id: 'txn-destination' }
    });
  });
});
