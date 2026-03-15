import { gql } from '@apollo/client';

export const ACCOUNTS_QUERY = gql`
  query Accounts {
    accounts {
      id
      name
      type
      currency
      balance
      isArchived
    }
  }
`;

export const TRANSACTIONS_QUERY = gql`
  query Transactions($filters: TransactionsFilterInput) {
    transactions(filters: $filters) {
      id
      accountId
      categoryId
      txnDate
      amount
      type
      description
      notes
      transferAccountId
      linkedTransactionId
      createdAt
      updatedAt
    }
  }
`;

export const MONTHLY_SUMMARY_QUERY = gql`
  query MonthlySummary($input: MonthlySummaryInput!) {
    monthlySummary(input: $input) {
      year
      month
      income
      expense
      balance
      byCategory {
        categoryId
        categoryName
        kind
        total
      }
    }
  }
`;
