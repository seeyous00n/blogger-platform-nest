import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../application/auth.service';
import { AuthRepository } from '../infrastructure/auth.repository';

@Injectable()
export class JwtRefreshAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private authService: AuthService,
    private authRepository: AuthRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const tokenData = await this.validateToke(refreshToken);
    const result = await this.authRepository.findSessionByIatAndDeviceId(
      tokenData.iat,
      tokenData.deviceId,
    );

    if (!result) {
      throw new UnauthorizedException();
    }

    request['userId'] = result.userId;

    return true;
  }

  async validateToke(refreshToken: string) {
    try {
      return await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException();
    }
  }
}
