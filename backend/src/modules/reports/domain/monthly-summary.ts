export interface MonthlySummaryCategoryTotal {
  categoryId: string;
  categoryName: string;
  kind: 'INCOME' | 'EXPENSE';
  total: string;
}

export interface MonthlySummary {
  year: number;
  month: number;
  income: string;
  expense: string;
  balance: string;
  byCategory: MonthlySummaryCategoryTotal[];
}
