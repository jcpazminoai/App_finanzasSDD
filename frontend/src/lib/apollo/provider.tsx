'use client';

import { ApolloProvider } from '@apollo/client';
import { PropsWithChildren } from 'react';
import { apolloClient } from '@/lib/apollo/client';

export function GraphqlProvider({ children }: PropsWithChildren) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
