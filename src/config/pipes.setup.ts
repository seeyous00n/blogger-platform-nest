import {
  HttpException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from '@nestjs/common';

type ErrorResponse = { message: string; field: string };

//TODO не уловил, в каком случае error.children будет не пустой??ааа
const errorFormatter = (errors: ValidationError[]): ErrorResponse[] => {
  const response = [] as ErrorResponse[];
  errors.forEach((error: ValidationError) => {
    const errorKeys = Object.keys(error.constraints);
    errorKeys.forEach((key: string) => {
      response.push({
        message: `${error.constraints[key]}; Current: ${error.value}`,
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
        throw new HttpException(
          { errorsMessages: result },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );
}
