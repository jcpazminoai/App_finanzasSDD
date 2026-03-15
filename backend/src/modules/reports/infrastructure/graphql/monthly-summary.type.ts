import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MonthlySummaryCategoryTotalType } from './monthly-summary-category-total.type';

@ObjectType()
export class MonthlySummaryType {
  @Field(() => Int)
  year!: number;

  @Field(() => Int)
  month!: number;

  @Field()
  income!: string;

  @Field()
  expense!: string;

  @Field()
  balance!: string;

  @Field(() => [MonthlySummaryCategoryTotalType])
  byCategory!: MonthlySummaryCategoryTotalType[];
}
