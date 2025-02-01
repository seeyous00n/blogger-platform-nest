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

  @IsNotEmpty({ message: 'Set the DB_TYPE in env file!' })
  dbType = this.configService.get<string>('DB_TYPE') as 'postgres';

  @IsNotEmpty({ message: 'Set the DB_HOST in env file!' })
  dbHost = this.configService.get<string>('DB_HOST');

  @IsNumber({}, { message: 'Set the DB_PORT in env file!' })
  dbPort = Number(this.configService.get<number>('DB_PORT'));

  @IsNotEmpty({ message: 'Set the DB_USER_NAME in env file!' })
  dbUserName = this.configService.get<string>('DB_USER_NAME');

  @IsNotEmpty({ message: 'Set the DB_PASS in env file!' })
  dbPassword = this.configService.get<string>('DB_PASS');

  @IsNotEmpty({ message: 'Set the DB_NAME in env file!' })
  dbName = this.configService.get<string>('DB_NAME');

  constructor(private configService: ConfigService) {
    configValidateUtils.validate(this);
  }
}
