import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { Transaction } from '@modules/transactions/domain/transaction';

interface CreateTransactionCommand {
  accountId: string;
  categoryId: string;
  txnDate: Date;
  amount: number;
  type: TransactionType;
  description?: string;
  notes?: string;
  transferAccountId?: string;
}

@Injectable()
export class CreateTransactionUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    command: CreateTransactionCommand
  ): Promise<Transaction> {
    this.validateCommand(command);

    return this.prismaService.$transaction(async (tx) => {
      const sourceAccount = await tx.account.findFirst({
        where: {
          id: command.accountId,
          userId: authenticatedUser.id,
          deletedAt: null,
          isArchived: false
        }
      });

      if (!sourceAccount) {
        throw new BadRequestException(
          'La cuenta seleccionada no existe o no pertenece al usuario.'
        );
      }

      const category = await tx.category.findFirst({
        where: {
          id: command.categoryId,
          OR: [{ userId: null }, { userId: authenticatedUser.id }]
        }
      });

      if (!category) {
        throw new BadRequestException(
          'La categoria seleccionada no existe o no esta permitida.'
        );
      }

      if (
        command.type !== 'TRANSFER' &&
        category.kind !== this.getExpectedCategoryKind(command.type)
      ) {
        throw new BadRequestException(
          'La categoria no corresponde al tipo de transaccion.'
        );
      }

      if (command.type === 'TRANSFER') {
        const transferAccount = await tx.account.findFirst({
          where: {
            id: command.transferAccountId,
            userId: authenticatedUser.id,
            deletedAt: null,
            isArchived: false
          }
        });

        if (!transferAccount) {
          throw new BadRequestException(
            'La cuenta destino no existe o no pertenece al usuario.'
          );
        }

        if (transferAccount.id === sourceAccount.id) {
          throw new BadRequestException(
            'La cuenta origen y destino no pueden ser la misma.'
          );
        }

        await tx.account.update({
          where: { id: sourceAccount.id },
          data: {
            balance: sourceAccount.balance.minus(command.amount)
          }
        });

        await tx.account.update({
          where: { id: transferAccount.id },
          data: {
            balance: transferAccount.balance.plus(command.amount)
          }
        });

        const sourceTransaction = await tx.transaction.create({
          data: {
            userId: authenticatedUser.id,
            accountId: sourceAccount.id,
            categoryId: category.id,
            txnDate: command.txnDate,
            amount: new Prisma.Decimal(command.amount),
            type: 'TRANSFER',
            description: command.description?.trim() || null,
            notes: command.notes?.trim() || null,
            transferAccountId: transferAccount.id
          }
        });

        const destinationTransaction = await tx.transaction.create({
          data: {
            userId: authenticatedUser.id,
            accountId: transferAccount.id,
            categoryId: category.id,
            txnDate: command.txnDate,
            amount: new Prisma.Decimal(command.amount),
            type: 'TRANSFER',
            description: command.description?.trim() || null,
            notes: command.notes?.trim() || null,
            transferAccountId: sourceAccount.id,
            linkedTransactionId: sourceTransaction.id
          }
        });

        const linkedSourceTransaction = await tx.transaction.update({
          where: {
            id: sourceTransaction.id
          },
          data: {
            linkedTransactionId: destinationTransaction.id
          }
        });

        return {
          id: linkedSourceTransaction.id,
          userId: linkedSourceTransaction.userId,
          accountId: linkedSourceTransaction.accountId,
          categoryId: linkedSourceTransaction.categoryId,
          txnDate: linkedSourceTransaction.txnDate,
          amount: linkedSourceTransaction.amount.toFixed(2),
          type: linkedSourceTransaction.type,
          description: linkedSourceTransaction.description,
          notes: linkedSourceTransaction.notes,
          isRecurring: linkedSourceTransaction.isRecurring,
          attachmentCount: linkedSourceTransaction.attachmentCount,
          transferAccountId: linkedSourceTransaction.transferAccountId,
          linkedTransactionId: linkedSourceTransaction.linkedTransactionId,
          createdAt: linkedSourceTransaction.createdAt,
          updatedAt: linkedSourceTransaction.updatedAt
        };
      } else {
        const balanceDelta =
          command.type === 'INCOME' ? command.amount : -command.amount;

        await tx.account.update({
          where: { id: sourceAccount.id },
          data: {
            balance: sourceAccount.balance.plus(balanceDelta)
          }
        });
      }

      const transaction = await tx.transaction.create({
        data: {
          userId: authenticatedUser.id,
          accountId: sourceAccount.id,
          categoryId: category.id,
          txnDate: command.txnDate,
          amount: new Prisma.Decimal(command.amount),
          type: command.type,
          description: command.description?.trim() || null,
          notes: command.notes?.trim() || null,
          transferAccountId: null
        }
      });

      return {
        id: transaction.id,
        userId: transaction.userId,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        txnDate: transaction.txnDate,
        amount: transaction.amount.toFixed(2),
        type: transaction.type,
        description: transaction.description,
        notes: transaction.notes,
        isRecurring: transaction.isRecurring,
        attachmentCount: transaction.attachmentCount,
        transferAccountId: transaction.transferAccountId,
        linkedTransactionId: transaction.linkedTransactionId,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      };
    });
  }

  private validateCommand(command: CreateTransactionCommand): void {
    if (command.amount <= 0) {
      throw new BadRequestException('El monto debe ser mayor que cero.');
    }

    if (Number.isNaN(command.txnDate.getTime())) {
      throw new BadRequestException('La fecha de la transaccion no es valida.');
    }

    if (command.type === 'TRANSFER' && !command.transferAccountId) {
      throw new BadRequestException(
        'Las transferencias requieren una cuenta destino.'
      );
    }
  }

  private getExpectedCategoryKind(
    type: TransactionType
  ): 'INCOME' | 'EXPENSE' {
    return type === 'INCOME' ? 'INCOME' : 'EXPENSE';
  }
}
