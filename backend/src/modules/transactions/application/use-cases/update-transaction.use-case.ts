import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Prisma,
  Transaction as PrismaTransaction,
  TransactionType
} from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { Transaction } from '@modules/transactions/domain/transaction';

interface UpdateTransactionCommand {
  id: string;
  accountId?: string;
  categoryId?: string;
  txnDate?: Date;
  amount?: number;
  type?: TransactionType;
  description?: string;
  notes?: string;
  transferAccountId?: string;
}

@Injectable()
export class UpdateTransactionUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    command: UpdateTransactionCommand
  ): Promise<Transaction> {
    return this.prismaService.$transaction(async (tx) => {
      const selectedTransaction = await tx.transaction.findFirst({
        where: {
          id: command.id,
          userId: authenticatedUser.id,
          deletedAt: null
        }
      });

      if (!selectedTransaction) {
        throw new BadRequestException(
          'La transaccion seleccionada no existe o no pertenece al usuario.'
        );
      }

      const existingState =
        selectedTransaction.type === 'TRANSFER'
          ? await this.getTransferState(tx, authenticatedUser.id, selectedTransaction)
          : {
              sourceTransaction: selectedTransaction,
              destinationTransaction: null
            };

      const baseTransaction = existingState.sourceTransaction;
      const nextCommand: Required<UpdateTransactionCommand> = {
        id: baseTransaction.id,
        accountId: command.accountId ?? baseTransaction.accountId,
        categoryId: command.categoryId ?? baseTransaction.categoryId,
        txnDate: command.txnDate ?? baseTransaction.txnDate,
        amount: command.amount ?? Number(baseTransaction.amount),
        type: command.type ?? baseTransaction.type,
        description:
          command.description !== undefined
            ? command.description
            : (baseTransaction.description ?? ''),
        notes:
          command.notes !== undefined ? command.notes : (baseTransaction.notes ?? ''),
        transferAccountId:
          command.transferAccountId ?? (baseTransaction.transferAccountId ?? '')
      };

      this.validateCommand(nextCommand);

      await this.revertExistingBalances(tx, authenticatedUser.id, existingState);

      const category = await this.getCategory(
        tx,
        authenticatedUser.id,
        nextCommand.categoryId
      );

      if (
        nextCommand.type !== 'TRANSFER' &&
        category.kind !== this.getExpectedCategoryKind(nextCommand.type)
      ) {
        throw new BadRequestException(
          'La categoria no corresponde al tipo de transaccion.'
        );
      }

      const sourceAccount = await this.getAccount(
        tx,
        authenticatedUser.id,
        nextCommand.accountId,
        false
      );

      if (nextCommand.type === 'TRANSFER') {
        const destinationAccount = await this.getAccount(
          tx,
          authenticatedUser.id,
          nextCommand.transferAccountId,
          false
        );

        if (destinationAccount.id === sourceAccount.id) {
          throw new BadRequestException(
            'La cuenta origen y destino no pueden ser la misma.'
          );
        }

        await tx.account.update({
          where: { id: sourceAccount.id },
          data: {
            balance: sourceAccount.balance.minus(nextCommand.amount)
          }
        });

        await tx.account.update({
          where: { id: destinationAccount.id },
          data: {
            balance: destinationAccount.balance.plus(nextCommand.amount)
          }
        });

        const normalizedDescription = nextCommand.description.trim() || null;
        const normalizedNotes = nextCommand.notes.trim() || null;

        if (existingState.destinationTransaction) {
          const updatedDestination = await tx.transaction.update({
            where: {
              id: existingState.destinationTransaction.id
            },
            data: {
              userId: authenticatedUser.id,
              accountId: destinationAccount.id,
              categoryId: category.id,
              txnDate: nextCommand.txnDate,
              amount: new Prisma.Decimal(nextCommand.amount),
              type: 'TRANSFER',
              description: normalizedDescription,
              notes: normalizedNotes,
              transferAccountId: sourceAccount.id,
              linkedTransactionId: existingState.sourceTransaction.id
            }
          });

          const updatedSource = await tx.transaction.update({
            where: {
              id: existingState.sourceTransaction.id
            },
            data: {
              userId: authenticatedUser.id,
              accountId: sourceAccount.id,
              categoryId: category.id,
              txnDate: nextCommand.txnDate,
              amount: new Prisma.Decimal(nextCommand.amount),
              type: 'TRANSFER',
              description: normalizedDescription,
              notes: normalizedNotes,
              transferAccountId: destinationAccount.id,
              linkedTransactionId: updatedDestination.id
            }
          });

          return this.mapTransaction(updatedSource);
        }

        const createdDestination = await tx.transaction.create({
          data: {
            userId: authenticatedUser.id,
            accountId: destinationAccount.id,
            categoryId: category.id,
            txnDate: nextCommand.txnDate,
            amount: new Prisma.Decimal(nextCommand.amount),
            type: 'TRANSFER',
            description: normalizedDescription,
            notes: normalizedNotes,
            transferAccountId: sourceAccount.id,
            linkedTransactionId: existingState.sourceTransaction.id
          }
        });

        const updatedSource = await tx.transaction.update({
          where: {
            id: existingState.sourceTransaction.id
          },
          data: {
            userId: authenticatedUser.id,
            accountId: sourceAccount.id,
            categoryId: category.id,
            txnDate: nextCommand.txnDate,
            amount: new Prisma.Decimal(nextCommand.amount),
            type: 'TRANSFER',
            description: normalizedDescription,
            notes: normalizedNotes,
            transferAccountId: destinationAccount.id,
            linkedTransactionId: createdDestination.id
          }
        });

        return this.mapTransaction(updatedSource);
      }

      const balanceDelta =
        nextCommand.type === 'INCOME' ? nextCommand.amount : -nextCommand.amount;

      await tx.account.update({
        where: { id: sourceAccount.id },
        data: {
          balance: sourceAccount.balance.plus(balanceDelta)
        }
      });

      const updatedSource = await tx.transaction.update({
        where: {
          id: existingState.sourceTransaction.id
        },
        data: {
          userId: authenticatedUser.id,
          accountId: sourceAccount.id,
          categoryId: category.id,
          txnDate: nextCommand.txnDate,
          amount: new Prisma.Decimal(nextCommand.amount),
          type: nextCommand.type,
          description: nextCommand.description.trim() || null,
          notes: nextCommand.notes.trim() || null,
          transferAccountId: null,
          linkedTransactionId: null
        }
      });

      if (existingState.destinationTransaction) {
        await tx.transaction.delete({
          where: {
            id: existingState.destinationTransaction.id
          }
        });
      }

      return this.mapTransaction(updatedSource);
    });
  }

  private async revertExistingBalances(
    tx: Prisma.TransactionClient,
    userId: string,
    state: {
      sourceTransaction: PrismaTransaction;
      destinationTransaction: PrismaTransaction | null;
    }
  ): Promise<void> {
    if (state.destinationTransaction) {
      const sourceAccount = await this.getAccount(
        tx,
        userId,
        state.sourceTransaction.accountId,
        true
      );
      const destinationAccount = await this.getAccount(
        tx,
        userId,
        state.destinationTransaction.accountId,
        true
      );

      await tx.account.update({
        where: { id: sourceAccount.id },
        data: {
          balance: sourceAccount.balance.plus(state.sourceTransaction.amount)
        }
      });

      await tx.account.update({
        where: { id: destinationAccount.id },
        data: {
          balance: destinationAccount.balance.minus(state.sourceTransaction.amount)
        }
      });

      return;
    }

    const sourceAccount = await this.getAccount(
      tx,
      userId,
      state.sourceTransaction.accountId,
      true
    );

    await tx.account.update({
      where: { id: sourceAccount.id },
      data: {
        balance:
          state.sourceTransaction.type === 'INCOME'
            ? sourceAccount.balance.minus(state.sourceTransaction.amount)
            : sourceAccount.balance.plus(state.sourceTransaction.amount)
      }
    });
  }

  private async getTransferState(
    tx: Prisma.TransactionClient,
    userId: string,
    transaction: PrismaTransaction
  ): Promise<{
    sourceTransaction: PrismaTransaction;
    destinationTransaction: PrismaTransaction;
  }> {
    if (!transaction.linkedTransactionId) {
      throw new BadRequestException(
        'La transferencia enlazada esta incompleta y no puede procesarse.'
      );
    }

    const linkedTransaction = await tx.transaction.findFirst({
      where: {
        id: transaction.linkedTransactionId,
        userId,
        deletedAt: null
      }
    });

    if (!linkedTransaction) {
      throw new BadRequestException(
        'La transferencia enlazada esta incompleta y no puede procesarse.'
      );
    }

    return this.orderTransferPair(transaction, linkedTransaction);
  }

  private orderTransferPair(
    first: PrismaTransaction,
    second: PrismaTransaction
  ): {
    sourceTransaction: PrismaTransaction;
    destinationTransaction: PrismaTransaction;
  } {
    const firstTime = first.updatedAt.getTime();
    const secondTime = second.updatedAt.getTime();

    if (firstTime === secondTime) {
      return first.id <= second.id
        ? { sourceTransaction: first, destinationTransaction: second }
        : { sourceTransaction: second, destinationTransaction: first };
    }

    return firstTime > secondTime
      ? { sourceTransaction: first, destinationTransaction: second }
      : { sourceTransaction: second, destinationTransaction: first };
  }

  private async getCategory(
    tx: Prisma.TransactionClient,
    userId: string,
    categoryId: string
  ) {
    const category = await tx.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId: null }, { userId }]
      }
    });

    if (!category) {
      throw new BadRequestException(
        'La categoria seleccionada no existe o no esta permitida.'
      );
    }

    return category;
  }

  private async getAccount(
    tx: Prisma.TransactionClient,
    userId: string,
    accountId: string,
    includeArchived: boolean
  ) {
    const account = await tx.account.findFirst({
      where: {
        id: accountId,
        userId,
        deletedAt: null,
        ...(includeArchived ? {} : { isArchived: false })
      }
    });

    if (!account) {
      throw new BadRequestException(
        'La cuenta seleccionada no existe o no pertenece al usuario.'
      );
    }

    return account;
  }

  private validateCommand(command: Required<UpdateTransactionCommand>): void {
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

  private mapTransaction(transaction: PrismaTransaction): Transaction {
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
  }
}
