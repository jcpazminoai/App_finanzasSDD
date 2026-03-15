import { Query, Resolver } from '@nestjs/graphql';
import { GetHealthStatusUseCase } from '@modules/health/application/use-cases/get-health-status.use-case';
import { HealthStatusType } from './health-status.type';

@Resolver(() => HealthStatusType)
export class HealthResolver {
  constructor(private readonly getHealthStatusUseCase: GetHealthStatusUseCase) {}

  @Query(() => HealthStatusType, { name: 'health' })
  async health(): Promise<HealthStatusType> {
    return this.getHealthStatusUseCase.execute();
  }
}
