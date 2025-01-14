import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

const BASIC = 'Basic';
const adminLogin = 'admin';
const adminPassword = 'qwerty';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const credentialsHash = this.extractCredentialsHashFromHeader(request);
    if (!credentialsHash) {
      throw new UnauthorizedException();
    }

    const credentials = Buffer.from(credentialsHash, 'base64').toString();
    const [userName, password] = credentials.split(':');

    if (userName !== adminLogin || password !== adminPassword) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractCredentialsHashFromHeader(
    request: Request,
  ): string | undefined {
    const [type, credentialsHash] =
      request.headers.authorization?.split(' ') ?? [];
    return type === BASIC ? credentialsHash : undefined;
  }
}
