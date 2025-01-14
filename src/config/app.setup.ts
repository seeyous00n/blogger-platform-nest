import { INestApplication } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';
import * as cookieParser from 'cookie-parser';
import { validationConstraintSetup } from './validation-constraint.setup';
import { exceptionFilterSetup } from './exception-filter.setup';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  app.enableCors();
  app.use(cookieParser());
  validationConstraintSetup(app);
  exceptionFilterSetup(app);
}
