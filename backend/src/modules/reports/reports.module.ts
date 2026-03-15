import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { GetMonthlySummaryUseCase } from './application/use-cases/get-monthly-summary.use-case';
import { ReportsResolver } from './infrastructure/graphql/reports.resolver';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ReportsResolver, GetMonthlySummaryUseCase]
})
export class ReportsModule {}
