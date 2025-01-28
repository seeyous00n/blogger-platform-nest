import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { AppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const coreConfig = app.get<AppConfig>(AppConfig);

  appSetup(app);
  await app.listen(coreConfig.port);
}

bootstrap();
