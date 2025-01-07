import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IpAndUserAgent = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = context.switchToHttp();
    return {
      ip: ctx.getRequest().ip,
      userAgent: ctx.getRequest().headers['user-agent'],
    };
  },
);
