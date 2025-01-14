import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const userIdFromParam = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    return request.userId;
  },
);
