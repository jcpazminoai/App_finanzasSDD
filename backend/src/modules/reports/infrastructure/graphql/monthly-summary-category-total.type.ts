import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MonthlySummaryCategoryTotalType {
  @Field()
  categoryId!: string;

  @Field()
  categoryName!: string;

  @Field()
  kind!: string;

  @Field()
  total!: string;
}
