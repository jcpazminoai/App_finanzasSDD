import { BadRequestException, Injectable } from '@nestjs/common';
import { AccountType } from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { Account } from '@modules/accounts/domain/account';

interface UpdateAccountCommand {
  id: string;
  name?: string;
  type?: AccountType;
  currency?: string;
}

@Injectable()
export class UpdateAccountUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    command: UpdateAccountCommand
  ): Promise<Account> {
    const account = await this.prismaService.account.findFirst({
      where: {
        id: command.id,
        userId: authenticatedUser.id,
        deletedAt: null
      }
    });

    if (!account) {
      throw new BadRequestException(
        'La cuenta seleccionada no existe o no pertenece al usuario.'
      );
    }

    const updated = await this.prismaService.account.update({
      where: {
        id: account.id
      },
      data: {
        name: command.name?.trim() ?? account.name,
        type: command.type ?? account.type,
        currency: command.currency?.trim().toUpperCase() ?? account.currency
      }
    });

    return {
      id: updated.id,
      userId: updated.userId,
      name: updated.name,
      type: updated.type,
      currency: updated.currency,
      balance: updated.balance.toFixed(2),
      isArchived: updated.isArchived,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };
  }
}
