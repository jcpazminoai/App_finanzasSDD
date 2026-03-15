import { Prisma } from '@prisma/client';
import { ListAccountsUseCase } from '../src/modules/accounts/application/use-cases/list-accounts.use-case';

describe('ListAccountsUseCase', () => {
  it('lists only the accounts for the authenticated user', async () => {
    const prismaService = {
      account: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'account-1',
            userId: 'user-1',
            name: 'Caja',
            type: 'CASH',
            currency: 'USD',
            balance: new Prisma.Decimal(120),
            isArchived: false,
            createdAt: new Date('2026-03-14T10:00:00Z'),
            updatedAt: new Date('2026-03-14T10:00:00Z'),
            deletedAt: null
          }
        ])
      }
    };

    const useCase = new ListAccountsUseCase(prismaService as never);

    await expect(
      useCase.execute({ id: 'user-1', email: 'user@example.com' })
    ).resolves.toEqual([
      {
        id: 'account-1',
        userId: 'user-1',
        name: 'Caja',
        type: 'CASH',
        currency: 'USD',
        balance: '120.00',
        isArchived: false,
        createdAt: new Date('2026-03-14T10:00:00Z'),
        updatedAt: new Date('2026-03-14T10:00:00Z')
      }
    ]);
    expect(prismaService.account.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  });
});
