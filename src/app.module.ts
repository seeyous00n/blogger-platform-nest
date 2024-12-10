import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { TestingModule } from './features/testing/testing.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest-bloggers-platform'),
    UserAccountsModule,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
