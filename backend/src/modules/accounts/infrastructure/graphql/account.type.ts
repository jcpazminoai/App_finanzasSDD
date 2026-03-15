import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AccountType {
  @Field()
  id!: string;

  @Field()
  userId!: string;

  @Field()
  name!: string;

  @Field()
  type!: string;

  @Field()
  currency!: string;

  @Field()
  balance!: string;

  @Field()
  isArchived!: boolean;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
