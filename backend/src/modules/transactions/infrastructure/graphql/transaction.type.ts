import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TransactionType {
  @Field()
  id!: string;

  @Field()
  userId!: string;

  @Field()
  accountId!: string;

  @Field()
  categoryId!: string;

  @Field(() => GraphQLISODateTime)
  txnDate!: Date;

  @Field()
  amount!: string;

  @Field()
  type!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String, { nullable: true })
  notes!: string | null;

  @Field()
  isRecurring!: boolean;

  @Field()
  attachmentCount!: number;

  @Field(() => String, { nullable: true })
  transferAccountId!: string | null;

  @Field(() => String, { nullable: true })
  linkedTransactionId!: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
