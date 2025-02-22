import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NotificationsModule } from '../notifications/notifications.module';
import { CryptoServiceModule } from '../../core/adapters/bcrypt/bcrypt-service.module';
import {
  ACCESS_TOKEN_INJECT,
  REFRESH_TOKEN_INJECT,
} from './constants/auth-tokens.jwt';
import { SecurityController } from './api/security.controller';
import { DeleteSessionUseCase } from './application/usecases/delete-session.usecase';
import { SecurityService } from './application/security.service';
import { DeleteSessionsUseCase } from './application/usecases/delete-sessions.usecase';
import { LogoutUseCase } from './application/usecases/logout.usecese';
import { RefreshTokenUseCase } from './application/usecases/refresh-token.usecese';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserAccountsConfig } from './config/user-accounts.config';
import { UsersSqlRepository } from './infrastructure/users-sql.repository';
import { UsersSqlQueryRepository } from './infrastructure/query/users-sql.query-repository';
import { AuthSqlRepository } from './infrastructure/auth-sql.repository';
import { SecuritySqlQueryRepository } from './infrastructure/query/security-sql.query-repository';

const useCases = [
  DeleteSessionUseCase,
  DeleteSessionsUseCase,
  LogoutUseCase,
  RefreshTokenUseCase,
];

@Module({
  imports: [JwtModule, NotificationsModule, CryptoServiceModule],
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
    UsersSqlRepository,
    UsersSqlQueryRepository,
    AuthService,
    AuthSqlRepository,
    SecurityService,
    SecuritySqlQueryRepository,
    ...useCases,
    UserAccountsConfig,
  ],
  exports: [UsersSqlRepository],
})
export class UserAccountsModule {}
