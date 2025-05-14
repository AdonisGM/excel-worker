import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { BodyJWT } from '../models/auth/auth.type';

export const AuthDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request['tokenData'] as BodyJWT;
  },
);
