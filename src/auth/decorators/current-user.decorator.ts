import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const contextType = ctx.getType<string>();

    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(ctx);
      return gqlContext.getContext().req.user;
    }

    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
