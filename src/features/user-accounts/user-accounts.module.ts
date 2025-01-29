import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Session, SessionSchema } from './domain/session.entity';
import { AuthRepository } from './infrastructure/auth.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { CryptoServiceModule } from '../../core/adapters/bcrypt/bcrypt-service.module';
import {
  ACCESS_TOKEN_INJECT,
  REFRESH_TOKEN_INJECT,
} from './constants/auth-tokens.jwt';
import { SecurityController } from './api/security.controller';
import { SecurityQueryRepository } from './infrastructure/query/security.query-repository';
import { DeleteSessionUseCase } from './application/usecases/delete-session.usecase';
import { SecurityService } from './application/security.service';
import { DeleteSessionsUseCase } from './application/usecases/delete-sessions.usecase';
import { LogoutUseCase } from './application/usecases/logout.usecese';
import { RefreshTokenUseCase } from './application/usecases/refresh-token.usecese';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserAccountsConfig } from './config/user-accounts.config';

const useCases = [
  DeleteSessionUseCase,
  DeleteSessionsUseCase,
  LogoutUseCase,
  RefreshTokenUseCase,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    JwtModule,
    NotificationsModule,
    CryptoServiceModule,
  ],
  controllers: [UsersController, AuthController, SecurityController],
  providers: [
    {
      provide: ACCESS_TOKEN_INJECT,
      useFactory: (userAccountsConfig: UserAccountsConfig) => {
        return new JwtService({
          secret: userAccountsConfig.jwtAccessSecret,
          signOptions: {
            expiresIn: userAccountsConfig.jwtAccessTokenExpires,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: REFRESH_TOKEN_INJECT,
      useFactory: (userAccountsConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountsConfig.jwtRefreshSecret,
          signOptions: {
            expiresIn: userAccountsConfig.jwtRefreshTokenExpires,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthService,
    AuthRepository,
    SecurityQueryRepository,
    SecurityService,
    ...useCases,
    UserAccountsConfig,
  ],
  exports: [MongooseModule, UsersRepository],
})
export class UserAccountsModule {}
