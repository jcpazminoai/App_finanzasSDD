import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { Account } from '@modules/accounts/domain/account';

@Injectable()
export class UnarchiveAccountUseCase {
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

    const restored = await this.prismaService.account.update({
      where: {
        id: account.id
      },
      data: {
        isArchived: false
      }
    });

    return {
      id: restored.id,
      userId: restored.userId,
      name: restored.name,
      type: restored.type,
      currency: restored.currency,
      balance: restored.balance.toFixed(2),
      isArchived: restored.isArchived,
      createdAt: restored.createdAt,
      updatedAt: restored.updatedAt
    };
  }
}
