import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class HealthStatusType {
  @Field()
  status!: string;

  @Field()
  service!: string;

  @Field()
  database!: string;
}
