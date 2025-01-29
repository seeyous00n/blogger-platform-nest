import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { configValidateUtils } from '../core/utils/config-validate.utils';

@Injectable()
export class AppConfig {
  @IsNumber({}, { message: 'Set the PORT in env file!' })
  port: number = Number(this.configService.get<number>('PORT'));

  @IsNotEmpty({ message: 'Set the MONGO_URI in env file!' })
  mongoURI: string = this.configService.get<string>('MONGO_URI');

  @IsNumber()
  restrictionTTL: number = Number(
    this.configService.get<number>('RESTRICTION_TTL'),
  );

  @IsNumber()
  restrictionLimit: number = Number(
    this.configService.get<number>('RESTRICTION_LIMIT'),
  );

  constructor(private configService: ConfigService) {
    configValidateUtils.validate(this);
  }
}
