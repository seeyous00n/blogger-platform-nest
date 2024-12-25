import { INestApplication, ValidationPipe } from '@nestjs/common';

export function appSetup(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.enableCors();
}
