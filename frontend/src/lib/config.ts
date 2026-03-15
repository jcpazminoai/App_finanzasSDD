const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;

if (!graphqlUrl) {
  throw new Error('NEXT_PUBLIC_GRAPHQL_URL is required');
}

export const appConfig = {
  graphqlUrl
};
