import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { Session, SessionSchema } from './domain/session.entity';
import { AuthRepository } from './infrastructure/auth.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { CryptoServiceModule } from '../../core/adapters/bcrypt/bcrypt-service.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES'),
        },
      }),
      inject: [ConfigService],
    }),
    NotificationsModule,
    CryptoServiceModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthService,
    AuthRepository,
  ],
  exports: [MongooseModule, UsersRepository],
})
export class UserAccountsModule {}
