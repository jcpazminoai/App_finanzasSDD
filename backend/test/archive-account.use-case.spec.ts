import { ArchiveAccountUseCase } from '../src/modules/accounts/application/use-cases/archive-account.use-case';

describe('ArchiveAccountUseCase', () => {
  it('archives an owned account', async () => {
    const prismaService = {
      account: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'account-1',
          userId: 'user-1',
          deletedAt: null
        }),
        update: jest.fn().mockResolvedValue({
          id: 'account-1',
          userId: 'user-1',
          name: 'Cuenta',
          type: 'BANK',
          currency: 'USD',
          balance: { toFixed: () => '25.00' },
          isArchived: true,
          createdAt: new Date('2026-03-14T12:00:00Z'),
          updatedAt: new Date('2026-03-15T12:00:00Z')
        })
      }
    };

    const useCase = new ArchiveAccountUseCase(prismaService as never);

    await expect(
      useCase.execute({ id: 'user-1', email: 'user@example.com' }, 'account-1')
    ).resolves.toMatchObject({
      id: 'account-1',
      isArchived: true
    });
  });
});
