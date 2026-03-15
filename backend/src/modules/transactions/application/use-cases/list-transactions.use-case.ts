import { Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { Transaction } from '@modules/transactions/domain/transaction';

interface ListTransactionsQuery {
  from?: Date;
  to?: Date;
  categoryId?: string;
  accountId?: string;
  type?: TransactionType;
}

@Injectable()
export class ListTransactionsUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    query: ListTransactionsQuery
  ): Promise<Transaction[]> {
    const where: Prisma.TransactionWhereInput = {
      userId: authenticatedUser.id,
      deletedAt: null
    };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.accountId) {
      where.accountId = query.accountId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.from || query.to) {
      where.txnDate = {};

      if (query.from) {
        where.txnDate.gte = query.from;
      }

      if (query.to) {
        where.txnDate.lte = query.to;
      }
    }

    const transactions = await this.prismaService.transaction.findMany({
      where,
      orderBy: [{ txnDate: 'desc' }, { createdAt: 'desc' }]
    });

    return transactions.map((transaction) => ({
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
    }));
  }
}
