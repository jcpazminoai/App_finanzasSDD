import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { Account } from '@modules/accounts/domain/account';

@Injectable()
export class ArchiveAccountUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    accountId: string
  ): Promise<Account> {
    const account = await this.prismaService.account.findFirst({
      where: {
        id: accountId,
        userId: authenticatedUser.id,
        deletedAt: null
      }
    });

    if (!account) {
      throw new BadRequestException(
        'La cuenta seleccionada no existe o no pertenece al usuario.'
      );
    }

    const archived = await this.prismaService.account.update({
      where: {
        id: account.id
      },
      data: {
        isArchived: true
      }
    });

    return {
      id: archived.id,
      userId: archived.userId,
      name: archived.name,
      type: archived.type,
      currency: archived.currency,
      balance: archived.balance.toFixed(2),
      isArchived: archived.isArchived,
      createdAt: archived.createdAt,
      updatedAt: archived.updatedAt
    };
  }
}
