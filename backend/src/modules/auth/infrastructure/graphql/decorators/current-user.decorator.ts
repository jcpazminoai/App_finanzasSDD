import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';

interface GraphQLRequestContext {
  req: {
    user?: AuthenticatedUser;
  };
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const gqlContext =
      GqlExecutionContext.create(context).getContext<GraphQLRequestContext>();

    return gqlContext.req.user as AuthenticatedUser;
  }
);
