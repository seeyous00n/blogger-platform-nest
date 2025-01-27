import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsNumber, validateSync } from 'class-validator';

@Injectable()
export class CoreConfig {
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
    const errors = validateSync(this);
    if (errors.length > 0) {
      const sortMessages = errors
        .map((error) => Object.values(error.constraints || {}).join(', '))
        .join(';\r\n');
      throw new Error('validation: ' + sortMessages);
    }
  }
}
