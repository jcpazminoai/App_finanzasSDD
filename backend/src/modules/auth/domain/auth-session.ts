export interface AuthUser {
  id: string;
  name: string;
  email: string;
  currency: string;
  locale: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
