import { config } from './config/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { TestingModule } from './features/testing/testing.module';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppConfig } from './config/app.config';
import { CoreModule } from './core/core.module';
import * as process from 'node:process';
import { AppConfigModule } from './config/app-config.module';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (appConfig: AppConfig) => ({
        type: appConfig.dbType,
        host: appConfig.dbHost,
        port: appConfig.dbPort,
        username: appConfig.dbUserName,
        password: appConfig.dbPassword,
        database: appConfig.dbName,
      }),
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
