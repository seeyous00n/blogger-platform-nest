import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

const BASIC = 'Basic';
const adminLogin = 'admin';
const adminPassword = 'qwerty';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return false;
    }

    const [type, credentialsHash] = authHeader.split(' ');
    if (type !== BASIC) {
      return false;
    }

    const credentials = Buffer.from(credentialsHash, 'base64').toString();
    const [userName, password] = credentials.split(':');

    return userName === adminLogin && password === adminPassword;
  }
}
