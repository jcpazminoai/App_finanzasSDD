import { Prisma } from '@prisma/client';
import { CreateAccountUseCase } from '../src/modules/accounts/application/use-cases/create-account.use-case';

describe('CreateAccountUseCase', () => {
  it('creates an account associated to the authenticated user', async () => {
    const prismaService = {
      account: {
        create: jest.fn().mockResolvedValue({
          id: 'account-1',
          userId: 'user-1',
          name: 'Cuenta principal',
          type: 'BANK',
          currency: 'USD',
          balance: new Prisma.Decimal(1500.5),
          isArchived: false,
          createdAt: new Date('2026-03-14T12:00:00Z'),
          updatedAt: new Date('2026-03-14T12:00:00Z')
        })
      }
    };

    const useCase = new CreateAccountUseCase(prismaService as never);

    await expect(
      useCase.execute(
        { id: 'user-1', email: 'user@example.com' },
        {
          name: 'Cuenta principal',
          type: 'BANK',
          currency: 'usd',
          initialBalance: 1500.5
        }
      )
    ).resolves.toMatchObject({
      userId: 'user-1',
      name: 'Cuenta principal',
      type: 'BANK',
      currency: 'USD',
      balance: '1500.50'
    });
  });
});
