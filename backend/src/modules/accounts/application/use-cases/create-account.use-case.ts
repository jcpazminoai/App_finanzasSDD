import { Injectable } from '@nestjs/common';
import { AccountType, Prisma } from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { Account } from '@modules/accounts/domain/account';

interface CreateAccountCommand {
  name: string;
  type: AccountType;
  currency: string;
  initialBalance?: number;
}

@Injectable()
export class CreateAccountUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    command: CreateAccountCommand
  ): Promise<Account> {
    const account = await this.prismaService.account.create({
      data: {
        userId: authenticatedUser.id,
        name: command.name.trim(),
        type: command.type,
        currency: command.currency.trim().toUpperCase(),
        balance: new Prisma.Decimal(command.initialBalance ?? 0)
      }
    });

    return {
      id: account.id,
      userId: account.userId,
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: account.balance.toFixed(2),
      isArchived: account.isArchived,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
  }
}
