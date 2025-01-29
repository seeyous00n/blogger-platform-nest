import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserAccountsConfig } from '../config/user-accounts.config';

const BEARER = 'Bearer';

@Injectable()
export class JwtOptionalAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      request['userId'] = null;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.userAccountsConfig.jwtAccessSecret,
      });

      request['userId'] = payload.userId;
    } catch {
      request['userId'] = null;
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === BEARER ? token : undefined;
  }
}
