import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { CurrentUser } from '@modules/auth/infrastructure/graphql/decorators/current-user.decorator';
import { GqlAuthGuard } from '@modules/auth/infrastructure/graphql/guards/gql-auth.guard';
import { GetMonthlySummaryUseCase } from '@modules/reports/application/use-cases/get-monthly-summary.use-case';
import { MonthlySummaryType } from './monthly-summary.type';
import { MonthlySummaryInput } from './inputs/monthly-summary.input';

@Resolver(() => MonthlySummaryType)
@UseGuards(GqlAuthGuard)
export class ReportsResolver {
  constructor(
    private readonly getMonthlySummaryUseCase: GetMonthlySummaryUseCase
  ) {}

  @Query(() => MonthlySummaryType, { name: 'monthlySummary' })
  async monthlySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: MonthlySummaryInput
  ): Promise<MonthlySummaryType> {
    return this.getMonthlySummaryUseCase.execute(user, input);
  }
}
