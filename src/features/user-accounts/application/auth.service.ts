import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { LoginUserInputDto } from '../api/input-dto/login-user.input-dto';
import { createUuid } from '../../../core/adapters/createUuid.utils';
import { CreateTokensInputDto } from '../dto/create-tokens.input-dto';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../infrastructure/auth.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionModelType } from '../domain/session.entity';
import { EmailService, TYPE_EMAIL } from '../../notifications/email.service';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../../../core/adapters/bcrypt/bcrypt.service';
import {
  BadRequestDomainException,
  UnauthorizedDomainException,
} from '../../../core/exceptions/domain-exception';
import { IatAndExpRefreshTokenType, PayloadType } from '../types/types';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private authRepository: AuthRepository,
    private emailService: EmailService,
    private configService: ConfigService,
    private cryptoService: CryptoService,
  ) {}

  async checkCredentials(data: LoginUserInputDto): Promise<string> {
    const result = await this.usersRepository.findByLoginOrEmail(
      data.loginOrEmail,
    );
    if (!result) {
      throw UnauthorizedDomainException.create();
    }

    const isAuth = await this.cryptoService.compareHash(
      data.password,
      result.passwordHash.hash,
    );
    if (!isAuth) {
      throw UnauthorizedDomainException.create();
    }

    return result._id.toString();
  }

  async login(data: CreateTokensInputDto) {
    const deviceId = createUuid();
    const payload = { deviceId, userId: data.userId };
    const tokens = this.getTokens(payload);
    const tokenData = this.getTokenData(tokens.refreshToken);

    const session = this.SessionModel.createInstance({
      userId: data.userId,
      tokenIat: tokenData.iat,
      tokenExp: tokenData.exp,
      ip: data.ip,
      title: data.title,
      deviceId: deviceId,
    });

    await this.authRepository.save(session);

    return { ...tokens };
  }

  async registration(id: string) {
    const user = await this.usersRepository.findById(id);

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    user.emailConfirmation.confirmationCode = createUuid();
    user.emailConfirmation.expirationDate = expirationDate;

    await this.usersRepository.save(user);

    this.emailService
      .sendEmail(user.email, user.emailConfirmation.confirmationCode)
      .catch(console.error);
  }

  async confirmation(code: string) {
    const user = await this.usersRepository.findByConfirmationCode(code);

    if (!user) {
      throw BadRequestDomainException.create('Incorrect code', 'code');
    }

    if (user.emailConfirmation.isConfirmed) {
      throw BadRequestDomainException.create('Code confirmed', 'code');
    }

    if (user.emailConfirmation.expirationDate < new Date()) {
      throw BadRequestDomainException.create('Code has expired', 'code');
    }

    user.emailConfirmation.isConfirmed = true;
    await this.usersRepository.save(user);
  }

  async resending(email: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw BadRequestDomainException.create('Email not found', 'email');
    }

    if (user.emailConfirmation.isConfirmed) {
      throw BadRequestDomainException.create('Email is confirmed', 'email');
    }

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    user.emailConfirmation.confirmationCode = createUuid();
    user.emailConfirmation.expirationDate = expirationDate;

    await this.usersRepository.save(user);

    this.emailService
      .sendEmail(
        user.email,
        user.emailConfirmation.confirmationCode,
        TYPE_EMAIL.RESEND_CODE,
      )
      .catch(console.error);
  }

  async recovery(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      return;
    }
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    user.passwordHash.recoveryCode = createUuid();
    user.passwordHash.expirationDate = expirationDate;

    await this.usersRepository.save(user);

    this.emailService
      .sendEmail(
        user.email,
        user.passwordHash.recoveryCode,
        TYPE_EMAIL.RECOVERY_CODE,
      )
      .catch(console.error);
  }

  async newPassword(code: string, password: string) {
    const user = await this.usersRepository.findByRecoveryCode(code);

    if (!user) {
      throw BadRequestDomainException.create(
        'Incorrect recovery code',
        'recoveryCode',
      );
    }

    if (user.passwordHash.expirationDate < new Date()) {
      throw BadRequestDomainException.create(
        'Recovery code expired',
        'recoveryCode',
      );
    }

    user.passwordHash.hash =
      await this.cryptoService.generatePasswordHash(password);

    await this.usersRepository.save(user);
  }

  getTokens(payload: PayloadType) {
    // const accessToken = this.jwtService.sign(
    //   { userId: payload.userId },
    //   {
    //     secret: this.configService.get('JWT_ACCESS_SECRET'),
    //     expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES'),
    //   },
    // );

    const accessToken = this.jwtService.sign({
      userId: payload.userId,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES'),
    });

    return { accessToken, refreshToken };
  }

  getTokenData(token: string): IatAndExpRefreshTokenType {
    const data = this.jwtService.decode(token) as PayloadType &
      IatAndExpRefreshTokenType;

    return { iat: data.iat, exp: data.exp };
  }
}
