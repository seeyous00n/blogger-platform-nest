import { DomainExceptionCode } from './domain-exception-code';

export class ErrorMessage {
  constructor(
    public message: string,
    public field: string,
  ) {}
}

export class DomainException extends Error {
  constructor(
    public message: string,
    public code: number,
    public extension: ErrorMessage[],
  ) {
    super(message);
  }
}

export class NotFoundDomainException extends DomainException {
  constructor(extension: ErrorMessage[]) {
    super('Not Found', DomainExceptionCode.NotFound, extension);
  }

  static create(message?: string, field?: string) {
    return new this(message ? [new ErrorMessage(message, field)] : []);
  }
}

export class UnauthorizedDomainException extends DomainException {
  constructor(extension: ErrorMessage[]) {
    super('Unauthorized', DomainExceptionCode.Unauthorized, extension);
  }

  static create(message?: string, field?: string) {
    return new this(message ? [new ErrorMessage(message, field)] : []);
  }
}

export class BadRequestDomainException extends DomainException {
  constructor(extension: ErrorMessage[]) {
    super('Bad Request', DomainExceptionCode.BadRequest, extension);
  }

  static create(message?: string, field?: string) {
    return new this(message ? [new ErrorMessage(message, field)] : []);
  }
}

export class ForbiddenDomainException extends DomainException {
  constructor(extension: ErrorMessage[]) {
    super('Forbidden', DomainExceptionCode.Forbidden, extension);
  }

  static create(message?: string, field?: string) {
    return new this(message ? [new ErrorMessage(message, field)] : []);
  }
}
