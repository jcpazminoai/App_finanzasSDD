import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthUserType {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  currency!: string;

  @Field()
  locale!: string;
}
