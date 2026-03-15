import { GetHealthStatusUseCase } from '../src/modules/health/application/use-cases/get-health-status.use-case';

describe('GetHealthStatusUseCase', () => {
  it('checks the database before reporting ok', async () => {
    const prismaService = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }])
    };

    const useCase = new GetHealthStatusUseCase(
      prismaService as never
    );

    await expect(useCase.execute()).resolves.toEqual({
      status: 'ok',
      service: 'app-finanzas-backend',
      database: 'connected'
    });
    expect(prismaService.$queryRaw).toHaveBeenCalledTimes(1);
  });
});
