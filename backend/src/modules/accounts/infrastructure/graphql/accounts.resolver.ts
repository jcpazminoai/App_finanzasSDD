import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ArchiveAccountUseCase } from '@modules/accounts/application/use-cases/archive-account.use-case';
import { CreateAccountUseCase } from '@modules/accounts/application/use-cases/create-account.use-case';
import { ListAccountsUseCase } from '@modules/accounts/application/use-cases/list-accounts.use-case';
import { UnarchiveAccountUseCase } from '@modules/accounts/application/use-cases/unarchive-account.use-case';
import { UpdateAccountUseCase } from '@modules/accounts/application/use-cases/update-account.use-case';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { CurrentUser } from '@modules/auth/infrastructure/graphql/decorators/current-user.decorator';
import { GqlAuthGuard } from '@modules/auth/infrastructure/graphql/guards/gql-auth.guard';
import { AccountType } from './account.type';
import { CreateAccountInput } from './inputs/create-account.input';
import { UpdateAccountInput } from './inputs/update-account.input';

@Resolver(() => AccountType)
@UseGuards(GqlAuthGuard)
export class AccountsResolver {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly listAccountsUseCase: ListAccountsUseCase,
    private readonly updateAccountUseCase: UpdateAccountUseCase,
    private readonly archiveAccountUseCase: ArchiveAccountUseCase,
    private readonly unarchiveAccountUseCase: UnarchiveAccountUseCase
  ) {}

  @Query(() => [AccountType], { name: 'accounts' })
  async accounts(
    @CurrentUser() user: AuthenticatedUser
  ): Promise<AccountType[]> {
    return this.listAccountsUseCase.execute(user);
  }

  @Mutation(() => AccountType, { name: 'createAccount' })
  async createAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: CreateAccountInput
  ): Promise<AccountType> {
    return this.createAccountUseCase.execute(user, input);
  }

  @Mutation(() => AccountType, { name: 'updateAccount' })
  async updateAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: UpdateAccountInput
  ): Promise<AccountType> {
    return this.updateAccountUseCase.execute(user, input);
  }

  @Mutation(() => AccountType, { name: 'archiveAccount' })
  async archiveAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Args('accountId') accountId: string
  ): Promise<AccountType> {
    return this.archiveAccountUseCase.execute(user, accountId);
  }

  @Mutation(() => AccountType, { name: 'unarchiveAccount' })
  async unarchiveAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Args('accountId') accountId: string
  ): Promise<AccountType> {
    return this.unarchiveAccountUseCase.execute(user, accountId);
  }
}
