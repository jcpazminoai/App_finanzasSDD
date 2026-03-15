import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { Account } from '@modules/accounts/domain/account';

@Injectable()
export class ListAccountsUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(authenticatedUser: AuthenticatedUser): Promise<Account[]> {
    const accounts = await this.prismaService.account.findMany({
      where: {
        userId: authenticatedUser.id,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return accounts.map((account) => ({
      id: account.id,
      userId: account.userId,
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: account.balance.toFixed(2),
      isArchived: account.isArchived,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    }));
  }
}
