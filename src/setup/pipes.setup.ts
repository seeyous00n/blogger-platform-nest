import {
  HttpException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from '@nestjs/common';

type ErrorResponse = { message: string; field: string };

const errorFormatter = (errors: ValidationError[]): ErrorResponse[] => {
  const response = [] as ErrorResponse[];
  errors.forEach((error: ValidationError) => {
    const errorKeys = Object.keys(error.constraints);
    errorKeys.forEach((key: string) => {
      response.push({
        message: `${error.constraints[key]}. Value: ${error.value}`,
        field: error.property,
      });
    });
  });

  return response;
};

export function pipesSetup(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const result = errorFormatter(errors);
        const resultErrors = { errorsMessages: result };
        throw new HttpException(resultErrors, HttpStatus.BAD_REQUEST);
      },
    }),
  );
}
