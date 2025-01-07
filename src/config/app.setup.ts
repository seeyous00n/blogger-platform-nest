import { INestApplication } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';
import * as cookieParser from 'cookie-parser';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  app.enableCors();
  app.use(cookieParser());
}
