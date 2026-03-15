import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CategoryType {
  @Field()
  id!: string;

  @Field(() => String, { nullable: true })
  userId!: string | null;

  @Field()
  name!: string;

  @Field()
  kind!: string;

  @Field(() => String, { nullable: true })
  icon!: string | null;

  @Field()
  isBuiltin!: boolean;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
