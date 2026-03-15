import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { CurrentUser } from '@modules/auth/infrastructure/graphql/decorators/current-user.decorator';
import { GqlAuthGuard } from '@modules/auth/infrastructure/graphql/guards/gql-auth.guard';
import { CreateTransactionUseCase } from '@modules/transactions/application/use-cases/create-transaction.use-case';
import { DeleteTransactionUseCase } from '@modules/transactions/application/use-cases/delete-transaction.use-case';
import { ListTransactionsUseCase } from '@modules/transactions/application/use-cases/list-transactions.use-case';
import { UpdateTransactionUseCase } from '@modules/transactions/application/use-cases/update-transaction.use-case';
import { TransactionType } from './transaction.type';
import { CreateTransactionInput } from './inputs/create-transaction.input';
import { TransactionsFilterInput } from './inputs/transactions-filter.input';
import { UpdateTransactionInput } from './inputs/update-transaction.input';

@Resolver(() => TransactionType)
@UseGuards(GqlAuthGuard)
export class TransactionsResolver {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly listTransactionsUseCase: ListTransactionsUseCase,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
    private readonly deleteTransactionUseCase: DeleteTransactionUseCase
  ) {}

  @Mutation(() => TransactionType, { name: 'createTransaction' })
  async createTransaction(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: CreateTransactionInput
  ): Promise<TransactionType> {
    return this.createTransactionUseCase.execute(user, {
      ...input,
      txnDate: new Date(input.txnDate)
    });
  }

  @Mutation(() => TransactionType, { name: 'updateTransaction' })
  async updateTransaction(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: UpdateTransactionInput
  ): Promise<TransactionType> {
    return this.updateTransactionUseCase.execute(user, {
      ...input,
      txnDate: input.txnDate ? new Date(input.txnDate) : undefined
    });
  }

  @Mutation(() => Boolean, { name: 'deleteTransaction' })
  async deleteTransaction(
    @CurrentUser() user: AuthenticatedUser,
    @Args('transactionId') transactionId: string
  ): Promise<boolean> {
    return this.deleteTransactionUseCase.execute(user, transactionId);
  }

  @Query(() => [TransactionType], { name: 'transactions' })
  async transactions(
    @CurrentUser() user: AuthenticatedUser,
    @Args('filters', { nullable: true }) filters?: TransactionsFilterInput
  ): Promise<TransactionType[]> {
    return this.listTransactionsUseCase.execute(user, {
      from: filters?.from ? new Date(filters.from) : undefined,
      to: filters?.to ? new Date(filters.to) : undefined,
      categoryId: filters?.categoryId,
      accountId: filters?.accountId,
      type: filters?.type
    });
  }
}
