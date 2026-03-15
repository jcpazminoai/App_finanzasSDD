import { gql } from '@apollo/client';

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

export const CREATE_TRANSACTION_MUTATION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      type
      amount
      accountId
      categoryId
      transferAccountId
      linkedTransactionId
      txnDate
      description
      notes
    }
  }
`;

export const UPDATE_TRANSACTION_MUTATION = gql`
  mutation UpdateTransaction($input: UpdateTransactionInput!) {
    updateTransaction(input: $input) {
      id
      type
      amount
      accountId
      categoryId
      transferAccountId
      linkedTransactionId
      txnDate
      description
      notes
      updatedAt
    }
  }
`;

export const DELETE_TRANSACTION_MUTATION = gql`
  mutation DeleteTransaction($transactionId: String!) {
    deleteTransaction(transactionId: $transactionId)
  }
`;
