import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type IpAndUserAgentType = {
  ip: string;
  userAgent: string;
};

export const IpAndUserAgent = createParamDecorator(
  (data: unknown, context: ExecutionContext): IpAndUserAgentType => {
    const request = context.switchToHttp().getRequest();
    return {
      ip: request.ip || '',
      userAgent: request.headers['user-agent'] || 'Oo',
    };
  },
);
