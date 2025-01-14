import { INestApplication } from '@nestjs/common';
import { DomainExceptionFilter } from '../core/exceptions/exception-filter';

export function exceptionFilterSetup(app: INestApplication) {
  app.useGlobalFilters(new DomainExceptionFilter());
}
