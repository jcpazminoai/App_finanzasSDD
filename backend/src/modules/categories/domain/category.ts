export type CategoryKindValue = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  kind: CategoryKindValue;
  icon: string | null;
  isBuiltin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
