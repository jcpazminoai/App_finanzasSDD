import { gql } from '@apollo/client';

export const CREATE_ACCOUNT_MUTATION = gql`
  mutation CreateAccount($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
      name
      type
      currency
      balance
      isArchived
    }
  }
`;

export const UPDATE_ACCOUNT_MUTATION = gql`
  mutation UpdateAccount($input: UpdateAccountInput!) {
    updateAccount(input: $input) {
      id
      name
      type
      currency
      balance
      isArchived
    }
  }
`;

export const ARCHIVE_ACCOUNT_MUTATION = gql`
  mutation ArchiveAccount($accountId: String!) {
    archiveAccount(accountId: $accountId) {
      id
      name
      isArchived
    }
  }
`;

export const UNARCHIVE_ACCOUNT_MUTATION = gql`
  mutation UnarchiveAccount($accountId: String!) {
    unarchiveAccount(accountId: $accountId) {
      id
      name
      isArchived
    }
  }
`;
