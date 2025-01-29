import { config } from './config/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { TestingModule } from './features/testing/testing.module';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppConfig } from './config/app.config';
import { CoreModule } from './core/core.module';
import * as process from 'node:process';
import { AppConfigModule } from './config/app-config.module';

const testingModule = [];
if (
  process.env.NODE_ENV === 'testing' ||
  process.env.NODE_ENV == 'development'
) {
  testingModule.push(TestingModule);
}

@Module({
  imports: [
    config,
    CoreModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (appConfig: AppConfig) => ({ uri: appConfig.mongoURI }),
      inject: [AppConfig],
    }),
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (appConfig: AppConfig) => [
        {
          ttl: appConfig.restrictionTTL,
          limit: appConfig.restrictionLimit,
        },
      ],
      inject: [AppConfig],
    }),
    UserAccountsModule,
    BloggersPlatformModule,
    ...testingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
