import { config } from './config/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { TestingModule } from './features/testing/testing.module';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    config,
    MongooseModule.forRoot(process.env.MONGO_URL),
    UserAccountsModule,
    BloggersPlatformModule,
    TestingModule,
    CqrsModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
