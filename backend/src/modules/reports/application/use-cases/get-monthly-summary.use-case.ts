import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import {
  MonthlySummary,
  MonthlySummaryCategoryTotal
} from '@modules/reports/domain/monthly-summary';

interface MonthlySummaryQuery {
  year: number;
  month: number;
}

interface GroupedTransactionTotal {
  categoryId: string;
  type: TransactionType;
  _sum: {
    amount: Prisma.Decimal | null;
  };
}

@Injectable()
export class GetMonthlySummaryUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    query: MonthlySummaryQuery
  ): Promise<MonthlySummary> {
    this.validateQuery(query);

    const range = this.buildMonthRange(query.year, query.month);

    // Global reports exclude TRANSFER rows on purpose. Transfers are stored as two
    // linked account movements, one per account, so counting them here would
    // double count internal money movement as if it were income/expense.
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        userId: authenticatedUser.id,
        deletedAt: null,
        type: {
          in: ['INCOME', 'EXPENSE']
        },
        txnDate: {
          gte: range.from,
          lt: range.to
        }
      },
      select: {
        type: true,
        amount: true
      }
    });

    const grouped = (await this.prismaService.transaction.groupBy({
      by: ['categoryId', 'type'],
      where: {
        userId: authenticatedUser.id,
        deletedAt: null,
        type: {
          in: ['INCOME', 'EXPENSE']
        },
        txnDate: {
          gte: range.from,
          lt: range.to
        }
      },
      _sum: {
        amount: true
      }
    })) as unknown as GroupedTransactionTotal[];

    const categoryIds = Array.from(new Set(grouped.map((item) => item.categoryId)));
    const categories = categoryIds.length
      ? await this.prismaService.category.findMany({
          where: {
            id: {
              in: categoryIds
            }
          },
          select: {
            id: true,
            name: true
          }
        })
      : [];

    const categoryNames = new Map(categories.map((item) => [item.id, item.name]));

    const income = transactions.reduce((total, transaction) => {
      if (transaction.type !== 'INCOME') {
        return total;
      }

      return total.plus(transaction.amount);
    }, new Prisma.Decimal(0));

    const expense = transactions.reduce((total, transaction) => {
      if (transaction.type === 'INCOME') {
        return total;
      }

      return total.plus(transaction.amount);
    }, new Prisma.Decimal(0));

    const byCategory: MonthlySummaryCategoryTotal[] = grouped
      .map((item) => ({
        categoryId: item.categoryId,
        categoryName: categoryNames.get(item.categoryId) ?? 'Sin nombre',
        kind: (item.type === 'INCOME' ? 'INCOME' : 'EXPENSE') as
          | 'INCOME'
          | 'EXPENSE',
        total: (item._sum.amount ?? new Prisma.Decimal(0)).toFixed(2)
      }))
      .sort((left, right) => {
        if (left.kind !== right.kind) {
          return left.kind.localeCompare(right.kind);
        }

        return left.categoryName.localeCompare(right.categoryName);
      });

    return {
      year: query.year,
      month: query.month,
      income: income.toFixed(2),
      expense: expense.toFixed(2),
      balance: income.minus(expense).toFixed(2),
      byCategory
    };
  }

  private validateQuery(query: MonthlySummaryQuery): void {
    if (!Number.isInteger(query.year) || query.year < 2000 || query.year > 2100) {
      throw new BadRequestException('El anio consultado no es valido.');
    }

    if (!Number.isInteger(query.month) || query.month < 1 || query.month > 12) {
      throw new BadRequestException('El mes consultado no es valido.');
    }
  }

  private buildMonthRange(year: number, month: number): { from: Date; to: Date } {
    const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const to = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

    return { from, to };
  }
}
