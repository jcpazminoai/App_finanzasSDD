import { Prisma } from '@prisma/client';
import { GetMonthlySummaryUseCase } from '../src/modules/reports/application/use-cases/get-monthly-summary.use-case';

describe('GetMonthlySummaryUseCase', () => {
  it('builds a monthly summary from user transactions', async () => {
    const prismaService = {
      transaction: {
        findMany: jest.fn().mockResolvedValue([
          {
            type: 'INCOME',
            amount: new Prisma.Decimal(2000)
          },
          {
            type: 'EXPENSE',
            amount: new Prisma.Decimal(350.75)
          }
        ]),
        groupBy: jest.fn().mockResolvedValue([
          {
            categoryId: 'cat-income',
            type: 'INCOME',
            _sum: {
              amount: new Prisma.Decimal(2000)
            }
          },
          {
            categoryId: 'cat-expense',
            type: 'EXPENSE',
            _sum: {
              amount: new Prisma.Decimal(350.75)
            }
          }
        ])
      },
      category: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'cat-income',
            name: 'Salario'
          },
          {
            id: 'cat-expense',
            name: 'Alimentacion'
          }
        ])
      }
    };

    const useCase = new GetMonthlySummaryUseCase(prismaService as never);

    await expect(
      useCase.execute(
        { id: 'user-1', email: 'user@example.com' },
        { year: 2026, month: 3 }
      )
    ).resolves.toEqual({
      year: 2026,
      month: 3,
      income: '2000.00',
      expense: '350.75',
      balance: '1649.25',
      byCategory: [
        {
          categoryId: 'cat-expense',
          categoryName: 'Alimentacion',
          kind: 'EXPENSE',
          total: '350.75'
        },
        {
          categoryId: 'cat-income',
          categoryName: 'Salario',
          kind: 'INCOME',
          total: '2000.00'
        }
      ]
    });
    expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        deletedAt: null,
        type: {
          in: ['INCOME', 'EXPENSE']
        },
        txnDate: {
          gte: new Date('2026-03-01T00:00:00.000Z'),
          lt: new Date('2026-04-01T00:00:00.000Z')
        }
      },
      select: {
        type: true,
        amount: true
      }
    });
  });
});
