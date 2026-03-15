import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { DeleteTransactionUseCase } from './application/use-cases/delete-transaction.use-case';
import { ListTransactionsUseCase } from './application/use-cases/list-transactions.use-case';
import { UpdateTransactionUseCase } from './application/use-cases/update-transaction.use-case';
import { TransactionsResolver } from './infrastructure/graphql/transactions.resolver';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    TransactionsResolver,
    CreateTransactionUseCase,
    ListTransactionsUseCase,
    UpdateTransactionUseCase,
    DeleteTransactionUseCase
  ]
})
export class TransactionsModule {}
