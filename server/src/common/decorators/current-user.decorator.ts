import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext) => {
    const http = ctx.switchToHttp();
    const request: Request = http.getRequest();

    return request.user;
  },
);
