import { Inject, Injectable } from '@nestjs/common';
import { LoginUserInputDto } from '../api/input-dto/login-user.input-dto';
import { createUuid } from '../../../core/utils/createUuid.utils';
import { CreateTokensInputDto } from '../dto/create-tokens.input-dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService, TYPE_EMAIL } from '../../notifications/email.service';
import { CryptoService } from '../../../core/adapters/bcrypt/bcrypt.service';
import {
  BadRequestDomainException,
  NotFoundDomainException,
  UnauthorizedDomainException,
} from '../../../core/exceptions/domain-exception';
import { IatAndExpRefreshTokenType, PayloadType } from '../types/types';
import {
  ACCESS_TOKEN_INJECT,
  REFRESH_TOKEN_INJECT,
} from '../constants/auth-tokens.jwt';
import { AuthSqlRepository } from '../infrastructure/auth-sql.repository';
import { UsersSqlRepository } from '../infrastructure/users-sql.repository';
import { CreateSessionSqlDto } from '../dto/sql-dto/create-session.sql-dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(ACCESS_TOKEN_INJECT)
    private accessTokeService: JwtService,
    @Inject(REFRESH_TOKEN_INJECT)
    private refreshTokenService: JwtService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private cryptoService: CryptoService,
    private authSqlRepository: AuthSqlRepository,
    private usersSqlRepository: UsersSqlRepository,
  ) {}

  async checkCredentials(data: LoginUserInputDto): Promise<string> {
    const user = await this.usersSqlRepository.findByLoginOrEmail(
      data.loginOrEmail,
    );

    if (!user) {
      throw UnauthorizedDomainException.create();
    }

    const isAuth = await this.cryptoService.compareHash(
      data.password,
      user.passwordHash,
    );
    if (!isAuth) {
      throw UnauthorizedDomainException.create();
    }

    return user.id;
  }

  async login(data: CreateTokensInputDto) {
    const deviceId = createUuid();
    const payload = { deviceId, userId: data.userId };
    const tokens = this.getTokens(payload);
    const tokenData = this.getTokenData(tokens.refreshToken);

    const session = CreateSessionSqlDto.mapToSql({
      userId: data.userId,
      tokenIat: tokenData.iat,
      tokenExp: tokenData.exp,
      ip: data.ip,
      title: data.title,
      deviceId: deviceId,
    });

    await this.authSqlRepository.create(session);
    return { ...tokens };
  }

  async registration(id: string) {
    const user = await this.usersSqlRepository.findById(id);
    if (!user) throw NotFoundDomainException.create();

    const { code, expirationDate } = this.generateDateAndCode();

    user.emailConfirmationCode = code;
    user.emailCodeExpirationDate = expirationDate;

    await this.usersSqlRepository.save(user);

    this.emailService.sendEmail(user.email, code).catch(console.error);
  }

  async confirmation(code: string) {
    const user = await this.usersSqlRepository.findByConfirmationCode(code);

    if (!user) {
      throw BadRequestDomainException.create('Incorrect code', 'code');
    }

    if (user.emailIsConfirmed) {
      throw BadRequestDomainException.create('Code confirmed', 'code');
    }

    if (user.emailCodeExpirationDate < new Date()) {
      throw BadRequestDomainException.create('Code has expired', 'code');
    }

    user.emailIsConfirmed = true;
    await this.usersSqlRepository.save(user);
  }

  async resending(email: string) {
    const user = await this.usersSqlRepository.findByEmail(email);

    if (!user) {
      throw BadRequestDomainException.create('Email not found', 'email');
    }

    if (user.emailIsConfirmed) {
      throw BadRequestDomainException.create('Email is confirmed', 'email');
    }

    const { code, expirationDate } = this.generateDateAndCode();

    user.emailConfirmationCode = code;
    user.emailCodeExpirationDate = expirationDate;

    await this.usersSqlRepository.save(user);

    this.emailService
      .sendEmail(email, code, TYPE_EMAIL.RESEND_CODE)
      .catch(console.error);
  }

  async recovery(email: string) {
    const user = await this.usersSqlRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const { code, expirationDate } = this.generateDateAndCode();

    user.passwordRecoveryCode = code;
    user.passwordExpirationDate = expirationDate;

    await this.usersSqlRepository.save(user);

    this.emailService
      .sendEmail(email, code, TYPE_EMAIL.RECOVERY_CODE)
      .catch(console.error);
  }

  async newPassword(code: string, password: string) {
    const user = await this.usersSqlRepository.findByRecoveryCode(code);

    if (!user) {
      throw BadRequestDomainException.create(
        'Incorrect recovery code',
        'recoveryCode',
      );
    }

    if (user.passwordExpirationDate < new Date()) {
      throw BadRequestDomainException.create(
        'Recovery code expired',
        'recoveryCode',
      );
    }

    user.passwordHash = await this.cryptoService.generatePasswordHash(password);

    await this.usersSqlRepository.save(user);
  }

  getTokens(payload: PayloadType) {
    const accessToken = this.accessTokeService.sign({
      userId: payload.userId,
    });

    const refreshToken = this.refreshTokenService.sign(payload);

    const { iat, exp } = this.getTokenData(refreshToken);

    return { accessToken, refreshToken, iat, exp };
  }

  getTokenData(token: string): IatAndExpRefreshTokenType & PayloadType {
    const data = this.jwtService.decode(token) as PayloadType &
      IatAndExpRefreshTokenType;

    return {
      userId: data.userId,
      deviceId: data.deviceId,
      iat: data.iat,
      exp: data.exp,
    };
  }

  async findSessionByIatAndDeviceIdOrError(iat: number, deviceId: string) {
    const session = await this.authSqlRepository.findSessionByIatAndDeviceId(
      iat,
      deviceId,
    );

    if (!session) {
      throw NotFoundDomainException.create();
    }

    return session;
  }

  generateDateAndCode() {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);
    const code = createUuid();

    return { expirationDate, code };
  }
}
