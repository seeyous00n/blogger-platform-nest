import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from './domain-exception';
import { DomainExceptionCode } from './domain-exception-code';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    this.onCatch(exception, response);
  }

  private onCatch(exception: DomainException, response: Response) {
    response.status(this.getStatusCode(exception.code)).json(
      exception.extension.length
        ? { errorsMessages: exception.extension }
        : {
            message: exception.message,
          },
    );
  }

  getStatusCode(code: DomainExceptionCode) {
    switch (code) {
      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;
      case DomainExceptionCode.BadRequest:
        return HttpStatus.BAD_REQUEST;
      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;
      case DomainExceptionCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;
      default:
        return HttpStatus.OK;
    }
  }
}
