import { ConfigModule } from '@nestjs/config';

export const config = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [
    process.env.NODE_FILE_PATH?.trim(),
    `.env.${process.env.NODE_ENV}.local`,
    `.env.${process.env.NODE_ENV}`,
    '.env.production',
  ],
});
