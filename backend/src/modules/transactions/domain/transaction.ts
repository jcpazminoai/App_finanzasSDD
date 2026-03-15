export type TransactionTypeValue = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  txnDate: Date;
  amount: string;
  type: TransactionTypeValue;
  description: string | null;
  notes: string | null;
  isRecurring: boolean;
  attachmentCount: number;
  transferAccountId: string | null;
  linkedTransactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
