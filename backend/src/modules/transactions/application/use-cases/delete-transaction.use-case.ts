import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { Prisma, Transaction as PrismaTransaction } from '@prisma/client';

@Injectable()
export class DeleteTransactionUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    transactionId: string
  ): Promise<boolean> {
    return this.prismaService.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: {
          id: transactionId,
          userId: authenticatedUser.id,
          deletedAt: null
        }
      });

      if (!transaction) {
        throw new BadRequestException(
          'La transaccion seleccionada no existe o no pertenece al usuario.'
        );
      }

      if (transaction.type === 'TRANSFER') {
        const { sourceTransaction, destinationTransaction } =
          await this.getTransferPair(tx, authenticatedUser.id, transaction);

        const sourceAccount = await this.getAccount(
          tx,
          authenticatedUser.id,
          sourceTransaction.accountId
        );
        const destinationAccount = await this.getAccount(
          tx,
          authenticatedUser.id,
          destinationTransaction.accountId
        );

        await tx.account.update({
          where: { id: sourceAccount.id },
          data: {
            balance: sourceAccount.balance.plus(sourceTransaction.amount)
          }
        });

        await tx.account.update({
          where: { id: destinationAccount.id },
          data: {
            balance: destinationAccount.balance.minus(sourceTransaction.amount)
          }
        });

        await tx.transaction.delete({
          where: { id: sourceTransaction.id }
        });

        await tx.transaction.delete({
          where: { id: destinationTransaction.id }
        });

        return true;
      }

      const account = await this.getAccount(
        tx,
        authenticatedUser.id,
        transaction.accountId
      );

      await tx.account.update({
        where: { id: account.id },
        data: {
          balance:
            transaction.type === 'INCOME'
              ? account.balance.minus(transaction.amount)
              : account.balance.plus(transaction.amount)
        }
      });

      await tx.transaction.delete({
        where: { id: transaction.id }
      });

      return true;
    });
  }

  private async getTransferPair(
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

  private async getAccount(
    tx: Prisma.TransactionClient,
    userId: string,
    accountId: string
  ) {
    const account = await tx.account.findFirst({
      where: {
        id: accountId,
        userId,
        deletedAt: null
      }
    });

    if (!account) {
      throw new BadRequestException(
        'La cuenta seleccionada no existe o no pertenece al usuario.'
      );
    }

    return account;
  }
}
