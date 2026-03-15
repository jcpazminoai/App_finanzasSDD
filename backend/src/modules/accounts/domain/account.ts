export type AccountTypeValue =
  | 'CASH'
  | 'BANK'
  | 'CREDIT_CARD'
  | 'WALLET'
  | 'INVESTMENT'
  | 'OTHER';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountTypeValue;
  currency: string;
  balance: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
