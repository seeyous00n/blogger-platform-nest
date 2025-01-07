import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type IpAndUserAgentType = {
  ip: string;
  userAgent: string;
};

//TODO where is the best place this decorator??aaa
export const IpAndUserAgent = createParamDecorator(
  (data: unknown, context: ExecutionContext): IpAndUserAgentType => {
    const request = context.switchToHttp().getRequest();
    return {
      ip: request.ip || '',
      userAgent: request.headers['user-agent'] || '',
    };
  },
);
