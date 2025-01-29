import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { configValidateUtils } from '../../../core/utils/config-validate.utils';

@Injectable()
export class UserAccountsConfig {
  @IsNotEmpty({ message: 'Set the JWT_ACCESS_SECRET in env file!' })
  jwtAccessSecret: string = this.configService.get<string>('JWT_ACCESS_SECRET');

  @IsNotEmpty({ message: 'Set the JWT_ACCESS_TOKEN_EXPIRES in env file!' })
  jwtAccessTokenExpires: string = this.configService.get<string>(
    'JWT_ACCESS_TOKEN_EXPIRES',
  );

  @IsNotEmpty({ message: 'Set the JWT_REFRESH_SECRET in env file!' })
  jwtRefreshSecret: string =
    this.configService.get<string>('JWT_REFRESH_SECRET');

  @IsNotEmpty({ message: 'Set the JWT_REFRESH_TOKEN_EXPIRES in env file!' })
  jwtRefreshTokenExpires: string = this.configService.get<string>(
    'JWT_REFRESH_TOKEN_EXPIRES',
  );

  constructor(private configService: ConfigService) {
    configValidateUtils.validate(this);
  }
}
