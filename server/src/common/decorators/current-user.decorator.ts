import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import type { JwtPayload } from '../../auth/types/jwt-payload';

type AuthenticatedRequest = Request & { user?: JwtPayload };

export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext) => {
    if (ctx.getType<string>() === 'graphql') {
      return GqlExecutionContext.create(ctx).getContext<{
        req: AuthenticatedRequest;
      }>().req.user;
    }

    const http = ctx.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();

    return request.user;
  },
);
