import { Module } from '@nestjs/common';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { HealthResolver } from './infrastructure/graphql/health.resolver';
import { GetHealthStatusUseCase } from './application/use-cases/get-health-status.use-case';

@Module({
  imports: [PrismaModule],
  providers: [HealthResolver, GetHealthStatusUseCase]
})
export class HealthModule {}
