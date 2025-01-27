import { config } from './config/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { TestingModule } from './features/testing/testing.module';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';
import * as process from 'node:process';

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
      useFactory: (coreConfig: CoreConfig) => ({ uri: coreConfig.mongoURI }),
      inject: [CoreConfig],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => [
        {
          ttl: coreConfig.restrictionTTL,
          limit: coreConfig.restrictionLimit,
        },
      ],
      inject: [CoreConfig],
    }),
    UserAccountsModule,
    BloggersPlatformModule,
    ...testingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
