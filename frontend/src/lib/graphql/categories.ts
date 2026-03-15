import { gql } from '@apollo/client';

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      userId
      name
      kind
      icon
      isBuiltin
    }
  }
`;

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      userId
      name
      kind
      icon
      isBuiltin
    }
  }
`;

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      id
      userId
      name
      kind
      icon
      isBuiltin
    }
  }
`;

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($categoryId: String!) {
    deleteCategory(categoryId: $categoryId)
  }
`;
