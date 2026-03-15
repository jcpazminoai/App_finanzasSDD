import { UpdateAccountUseCase } from '../src/modules/accounts/application/use-cases/update-account.use-case';

describe('UpdateAccountUseCase', () => {
  it('updates editable account fields for the authenticated user', async () => {
    const prismaService = {
      account: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'account-1',
          userId: 'user-1',
          name: 'Cuenta vieja',
          type: 'BANK',
          currency: 'USD',
          balance: { toFixed: () => '10.00' },
          isArchived: false,
          createdAt: new Date('2026-03-14T12:00:00Z'),
          updatedAt: new Date('2026-03-14T12:00:00Z'),
          deletedAt: null
        }),
        update: jest.fn().mockResolvedValue({
          id: 'account-1',
          userId: 'user-1',
          name: 'Cuenta nueva',
          type: 'CASH',
          currency: 'EUR',
          balance: { toFixed: () => '10.00' },
          isArchived: false,
          createdAt: new Date('2026-03-14T12:00:00Z'),
          updatedAt: new Date('2026-03-15T12:00:00Z')
        })
      }
    };

    const useCase = new UpdateAccountUseCase(prismaService as never);

    await expect(
      useCase.execute(
        { id: 'user-1', email: 'user@example.com' },
        { id: 'account-1', name: 'Cuenta nueva', type: 'CASH', currency: 'eur' }
      )
    ).resolves.toMatchObject({
      id: 'account-1',
      name: 'Cuenta nueva',
      type: 'CASH',
      currency: 'EUR'
    });
  });
});
