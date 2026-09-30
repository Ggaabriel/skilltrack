import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { JwtPayload } from '../../auth/types/jwt-payload';

type AuthenticatedRequest = Request & { user?: JwtPayload };

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    if (context.getType<string>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext<{
        req: AuthenticatedRequest;
      }>().req;
    }

    return context.switchToHttp().getRequest<AuthenticatedRequest>();
  }
}
