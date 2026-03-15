import { Module } from '@nestjs/common';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { AuthResolver } from './infrastructure/graphql/auth.resolver';
import { GqlAuthGuard } from './infrastructure/graphql/guards/gql-auth.guard';
import { PasswordService } from './infrastructure/security/password.service';
import { TokenService } from './infrastructure/security/token.service';

@Module({
  imports: [PrismaModule],
  providers: [
    AuthResolver,
    GetCurrentUserUseCase,
    RegisterUserUseCase,
    LoginUseCase,
    GqlAuthGuard,
    PasswordService,
    TokenService
  ],
  exports: [GqlAuthGuard, TokenService]
})
export class AuthModule {}
