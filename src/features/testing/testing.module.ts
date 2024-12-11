import { Module } from '@nestjs/common';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { TestingController } from './testing.controller';
import { BloggersPlatformModule } from '../bloggers-platform/bloggers-platform.module';

@Module({
  imports: [UserAccountsModule, BloggersPlatformModule],
  controllers: [TestingController],
})
export class TestingModule {}
