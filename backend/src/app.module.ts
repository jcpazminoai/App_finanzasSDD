import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AccountsModule } from '@modules/accounts/accounts.module';
import { AuthModule } from '@modules/auth/auth.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { HealthModule } from '@modules/health/health.module';
import { ReportsModule } from '@modules/reports/reports.module';
import { TransactionsModule } from '@modules/transactions/transactions.module';
import { validateEnv } from '@shared/config/env.validation';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['../../.env', '.env']
    }),
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      context: ({ req }: { req: unknown }) => ({ req })
    }),
    AccountsModule,
    AuthModule,
    CategoriesModule,
    HealthModule,
    ReportsModule,
    TransactionsModule
  ]
})
export class AppModule {}
