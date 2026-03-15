'use client';

import {
  ApolloClient,
  ApolloError,
  NormalizedCacheObject,
  useApolloClient,
  useMutation
} from '@apollo/client';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { CURRENT_USER_QUERY, LOGIN_MUTATION, REGISTER_MUTATION } from '@/lib/graphql/auth';
import { clearStoredSession, getStoredAccessToken, persistSession } from '@/lib/auth-storage';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  currency: string;
  locale: string;
}

interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface LoginVariables {
  input: {
    email: string;
    password: string;
  };
}

interface RegisterVariables {
  input: {
    name: string;
    email: string;
    password: string;
    currency?: string;
    locale?: string;
  };
}

interface CurrentUserQueryData {
  currentUser: AuthUser;
}

interface LoginMutationData {
  login: AuthSessionResponse;
}

interface RegisterMutationData {
  register: AuthSessionResponse;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterVariables['input']) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function formatApolloError(error: ApolloError): string {
  const graphQLError = error.graphQLErrors[0];

  if (graphQLError?.message) {
    return graphQLError.message;
  }

  return error.message || 'No fue posible completar la solicitud.';
}

async function loadCurrentUser(client: ReturnType<typeof useApolloClient>) {
  return client.query<CurrentUserQueryData>({
    query: CURRENT_USER_QUERY,
    fetchPolicy: 'network-only'
  });
}

export function AuthProvider({ children }: PropsWithChildren) {
  const client = useApolloClient() as ApolloClient<NormalizedCacheObject>;
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [runLogin] = useMutation<LoginMutationData, LoginVariables>(LOGIN_MUTATION);
  const [runRegister] = useMutation<RegisterMutationData, RegisterVariables>(REGISTER_MUTATION);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const token = getStoredAccessToken();

      if (!token) {
        if (isMounted) {
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const result = await loadCurrentUser(client);

        if (isMounted) {
          setUser(result.data.currentUser);
        }
      } catch {
        clearStoredSession();
        await client.clearStore();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [client]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login: async (email, password) => {
        try {
          const result = await runLogin({
            variables: {
              input: {
                email,
                password
              }
            }
          });

          const session = result.data?.login;

          if (!session) {
            throw new Error('La sesion no pudo iniciarse.');
          }

          persistSession(session.accessToken, session.refreshToken);
          setUser(session.user);
          await client.clearStore();
        } catch (error) {
          if (error instanceof ApolloError) {
            throw new Error(formatApolloError(error));
          }

          throw error;
        }
      },
      register: async (input) => {
        try {
          const result = await runRegister({
            variables: {
              input
            }
          });

          const session = result.data?.register;

          if (!session) {
            throw new Error('La cuenta no pudo crearse.');
          }

          persistSession(session.accessToken, session.refreshToken);
          setUser(session.user);
          await client.clearStore();
        } catch (error) {
          if (error instanceof ApolloError) {
            throw new Error(formatApolloError(error));
          }

          throw error;
        }
      },
      logout: async () => {
        clearStoredSession();
        setUser(null);
        await client.clearStore();
      }
    }),
    [client, isBootstrapping, runLogin, runRegister, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
