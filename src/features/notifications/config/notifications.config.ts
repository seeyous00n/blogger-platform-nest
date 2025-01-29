import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { configValidateUtils } from '../../../core/utils/config-validate.utils';

@Injectable()
export class NotificationsConfig {
  @IsNotEmpty({ message: 'Set the SMTP_HOST in env file!' })
  smtpHost: string = this.configService.get<string>('SMTP_HOST');

  @IsNotEmpty({ message: 'Set the SMTP_PORT in env file!' })
  @IsNumber({}, { message: 'PORT in env file must be a number' })
  smtpPort: number = Number(this.configService.get<number>('SMTP_PORT'));

  @IsNotEmpty({ message: 'Set the SMTP_AUTH_USER in env file!' })
  smtpAuthUser: string = this.configService.get<string>('SMTP_AUTH_USER');

  @IsNotEmpty({ message: 'Set the SMTP_AUTH_PASS in env file!' })
  smtpAuthPass: string = this.configService.get<string>('SMTP_AUTH_PASS');

  constructor(private configService: ConfigService<any, true>) {
    configValidateUtils.validate(this);
  }
}
