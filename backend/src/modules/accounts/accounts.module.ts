import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { ArchiveAccountUseCase } from './application/use-cases/archive-account.use-case';
import { CreateAccountUseCase } from './application/use-cases/create-account.use-case';
import { ListAccountsUseCase } from './application/use-cases/list-accounts.use-case';
import { UnarchiveAccountUseCase } from './application/use-cases/unarchive-account.use-case';
import { UpdateAccountUseCase } from './application/use-cases/update-account.use-case';
import { AccountsResolver } from './infrastructure/graphql/accounts.resolver';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    AccountsResolver,
    CreateAccountUseCase,
    ListAccountsUseCase,
    UpdateAccountUseCase,
    ArchiveAccountUseCase,
    UnarchiveAccountUseCase
  ]
})
export class AccountsModule {}
