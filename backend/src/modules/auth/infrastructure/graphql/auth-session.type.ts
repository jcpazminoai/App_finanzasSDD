import { Field, ObjectType } from '@nestjs/graphql';
import { AuthUserType } from './auth-user.type';

@ObjectType()
export class AuthSessionType {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;

  @Field(() => AuthUserType)
  user!: AuthUserType;
}
