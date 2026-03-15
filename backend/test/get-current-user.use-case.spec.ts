import { UnauthorizedException } from '@nestjs/common';
import { GetCurrentUserUseCase } from '../src/modules/auth/application/use-cases/get-current-user.use-case';

describe('GetCurrentUserUseCase', () => {
  it('returns the persisted user for a valid token identity', async () => {
    const prismaService = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          name: 'Ada',
          email: 'ada@example.com',
          currency: 'USD',
          locale: 'es-CO',
          deletedAt: null
        })
      }
    };

    const useCase = new GetCurrentUserUseCase(prismaService as never);

    await expect(
      useCase.execute({ id: 'user-1', email: 'ada@example.com' })
    ).resolves.toEqual({
      id: 'user-1',
      name: 'Ada',
      email: 'ada@example.com',
      currency: 'USD',
      locale: 'es-CO'
    });
  });

  it('rejects users that no longer match the token identity', async () => {
    const prismaService = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          name: 'Ada',
          email: 'otro@example.com',
          currency: 'USD',
          locale: 'es-CO',
          deletedAt: null
        })
      }
    };

    const useCase = new GetCurrentUserUseCase(prismaService as never);

    await expect(
      useCase.execute({ id: 'user-1', email: 'ada@example.com' })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
