import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GetCurrentUserUseCase } from '@modules/auth/application/use-cases/get-current-user.use-case';
import { LoginUseCase } from '@modules/auth/application/use-cases/login.use-case';
import { RegisterUserUseCase } from '@modules/auth/application/use-cases/register-user.use-case';
import { AuthSessionType } from './auth-session.type';
import { AuthUserType } from './auth-user.type';
import { CurrentUser } from './decorators/current-user.decorator';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { LoginInput } from './inputs/login.input';
import { RegisterUserInput } from './inputs/register-user.input';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase
  ) {}

  @Mutation(() => AuthSessionType, { name: 'register' })
  async register(
    @Args('input') input: RegisterUserInput
  ): Promise<AuthSessionType> {
    return this.registerUserUseCase.execute(input);
  }

  @Mutation(() => AuthSessionType, { name: 'login' })
  async login(@Args('input') input: LoginInput): Promise<AuthSessionType> {
    return this.loginUseCase.execute(input);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => AuthUserType, { name: 'currentUser' })
  async currentUser(
    @CurrentUser() user: AuthenticatedUser
  ): Promise<AuthUserType> {
    return this.getCurrentUserUseCase.execute(user);
  }
}
