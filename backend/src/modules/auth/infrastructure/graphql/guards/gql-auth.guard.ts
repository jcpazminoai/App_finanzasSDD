import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { TokenService } from '@modules/auth/infrastructure/security/token.service';

interface GraphQLRequestContext {
  req: {
    headers: Record<string, string | string[] | undefined>;
    user?: AuthenticatedUser;
  };
}

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const gqlContext =
      GqlExecutionContext.create(context).getContext<GraphQLRequestContext>();
    const authorizationHeader = gqlContext.req.headers.authorization;
    const token = this.extractBearerToken(authorizationHeader);

    if (!token) {
      throw new UnauthorizedException('Token de acceso requerido.');
    }

    gqlContext.req.user = this.tokenService.verifyAccessToken(token);

    return true;
  }

  private extractBearerToken(
    authorizationHeader: string | string[] | undefined
  ): string | null {
    if (typeof authorizationHeader !== 'string') {
      return null;
    }

    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
