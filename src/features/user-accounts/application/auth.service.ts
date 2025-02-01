import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { LoginUserInputDto } from '../api/input-dto/login-user.input-dto';
import { createUuid } from '../../../core/utils/createUuid.utils';
import { CreateTokensInputDto } from '../dto/create-tokens.input-dto';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../infrastructure/auth.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionModelType } from '../domain/session.entity';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
    private usersRepository: UsersRepository,
    @Inject(ACCESS_TOKEN_INJECT)
    private accessTokeService: JwtService,
    @Inject(REFRESH_TOKEN_INJECT)
    private refreshTokenService: JwtService,
    private jwtService: JwtService,
    private authRepository: AuthRepository,
    private emailService: EmailService,
    private cryptoService: CryptoService,
    private authSqlRepository: AuthSqlRepository,
    private usersSqlRepository: UsersSqlRepository,
  ) {}

  // async checkCredentials(data: LoginUserInputDto): Promise<string> {
  //   const result = await this.usersRepository.findByLoginOrEmail(
  //     data.loginOrEmail,
  //   );
  //   if (!result) {
  //     throw UnauthorizedDomainException.create();
  //   }
  //
  //   const isAuth = await this.cryptoService.compareHash(
  //     data.password,
  //     result.passwordHash.hash,
  //   );
  //   if (!isAuth) {
  //     throw UnauthorizedDomainException.create();
  //   }
  //
  //   return result._id.toString();
  // }

  async checkCredentials(data: LoginUserInputDto): Promise<string> {
    const result = await this.usersSqlRepository.findByLoginOrEmail(
      data.loginOrEmail,
    );

    if (!result.length) {
      throw UnauthorizedDomainException.create();
    }

    const isAuth = await this.cryptoService.compareHash(
      data.password,
      result[0].password_hash,
    );
    if (!isAuth) {
      throw UnauthorizedDomainException.create();
    }

    return result[0].id;
  }

  // async login(data: CreateTokensInputDto) {
  //   const deviceId = createUuid();
  //   const payload = { deviceId, userId: data.userId };
  //   const tokens = this.getTokens(payload);
  //   const tokenData = this.getTokenData(tokens.refreshToken);
  //
  //   const session = this.SessionModel.createInstance({
  //     userId: data.userId,
  //     tokenIat: tokenData.iat,
  //     tokenExp: tokenData.exp,
  //     ip: data.ip,
  //     title: data.title,
  //     deviceId: deviceId,
  //   });
  //
  //   await this.authRepository.save(session);
  //
  //   return { ...tokens };
  // }

  async login(data: CreateTokensInputDto) {
    const deviceId = createUuid();
    const payload = { deviceId, userId: data.userId };
    const tokens = this.getTokens(payload);
    const tokenData = this.getTokenData(tokens.refreshToken);

    // const session = this.SessionModel.createInstance({
    //   userId: data.userId,
    //   tokenIat: tokenData.iat,
    //   tokenExp: tokenData.exp,
    //   ip: data.ip,
    //   title: data.title,
    //   deviceId: deviceId,
    // });
    //
    // await this.authRepository.save(session);

    return { ...tokens };
  }

  // async registration(id: string) {
  //   const user = await this.usersRepository.findById(id);
  //
  //   const expirationDate = new Date();
  //   expirationDate.setHours(expirationDate.getHours() + 1);
  //
  //   user.emailConfirmation.confirmationCode = createUuid();
  //   user.emailConfirmation.expirationDate = expirationDate;
  //
  //   await this.usersRepository.save(user);
  //
  //   this.emailService
  //       .sendEmail(user.email, user.emailConfirmation.confirmationCode)
  //       .catch(console.error);
  // }

  async registration(id: string) {
    const user = await this.usersSqlRepository.findById(id);

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);
    const confirmationCode = createUuid();

    await this.usersSqlRepository.updateEmailConfirmationInfo({
      id: user[0].id,
      expirationDate,
      confirmationCode,
    });

    // user.emailConfirmation.confirmationCode = createUuid();
    // user.emailConfirmation.expirationDate = expirationDate;
    //
    // await this.usersRepository.save(user);

    this.emailService
      .sendEmail(user[0].email, confirmationCode)
      .catch(console.error);
  }

  // async confirmation(code: string) {
  //   const user = await this.usersRepository.findByConfirmationCode(code);
  //
  //   if (!user) {
  //     throw BadRequestDomainException.create('Incorrect code', 'code');
  //   }
  //
  //   if (user.emailConfirmation.isConfirmed) {
  //     throw BadRequestDomainException.create('Code confirmed', 'code');
  //   }
  //
  //   if (user.emailConfirmation.expirationDate < new Date()) {
  //     throw BadRequestDomainException.create('Code has expired', 'code');
  //   }
  //
  //   user.emailConfirmation.isConfirmed = true;
  //   await this.usersRepository.save(user);
  // }

  async confirmation(code: string) {
    const user = await this.usersSqlRepository.findByConfirmationCode(code);
    console.log('user confirmation: ', user);
    if (!user.length) {
      throw BadRequestDomainException.create('Incorrect code', 'code');
    }

    if (user[0].email_is_confirmed) {
      throw BadRequestDomainException.create('Code confirmed', 'code');
    }

    if (user[0].email_code_expiration_date < new Date()) {
      throw BadRequestDomainException.create('Code has expired', 'code');
    }

    await this.usersSqlRepository.setIsConfirmed(user[0].id);

    // user.emailConfirmation.isConfirmed = true;
    // await this.usersRepository.save(user);
  }

  async resending(email: string) {
    const user = await this.usersSqlRepository.findByEmail(email);

    if (!user.length) {
      throw BadRequestDomainException.create('Email not found', 'email');
    }

    if (user[0].email_is_confirmed) {
      throw BadRequestDomainException.create('Email is confirmed', 'email');
    }

    //TODO Все обновление updateEmail и зфыыцщкв вынеси в отделный метод
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);
    const confirmationCode = createUuid();

    await this.usersSqlRepository.updateEmailConfirmationInfo({
      id: user[0].id,
      expirationDate,
      confirmationCode,
    });

    this.emailService
      .sendEmail(email, confirmationCode, TYPE_EMAIL.RESEND_CODE)
      .catch(console.error);
  }

  // async recovery(email: string) {
  //   const user = await this.usersRepository.findByEmail(email);
  //   if (!user) {
  //     return;
  //   }
  //   const expirationDate = new Date();
  //   expirationDate.setHours(expirationDate.getHours() + 1);
  //
  //   user.passwordHash.recoveryCode = createUuid();
  //   user.passwordHash.expirationDate = expirationDate;
  //
  //   await this.usersRepository.save(user);
  //
  //   this.emailService
  //       .sendEmail(
  //           user.email,
  //           user.passwordHash.recoveryCode,
  //           TYPE_EMAIL.RECOVERY_CODE,
  //       )
  //       .catch(console.error);
  // }

  async recovery(email: string) {
    const user = await this.usersSqlRepository.findByEmail(email);
    if (!user.length) {
      return;
    }

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);
    const recoveryCode = createUuid();

    await this.usersSqlRepository.updatePasswordConfirmationInfo({
      id: user[0].id,
      expirationDate,
      recoveryCode,
    });

    // user.passwordHash.recoveryCode = createUuid();
    // user.passwordHash.expirationDate = expirationDate;
    //
    // await this.usersRepository.save(user);

    this.emailService
      .sendEmail(email, recoveryCode, TYPE_EMAIL.RECOVERY_CODE)
      .catch(console.error);
  }

  async newPassword(code: string, password: string) {
    const user = await this.usersSqlRepository.findByRecoveryCode(code);

    if (!user.length) {
      throw BadRequestDomainException.create(
        'Incorrect recovery code',
        'recoveryCode',
      );
    }

    if (user[0].password_expiration_date < new Date()) {
      throw BadRequestDomainException.create(
        'Recovery code expired',
        'recoveryCode',
      );
    }

    const passwordHash =
      await this.cryptoService.generatePasswordHash(password);

    await this.usersSqlRepository.updatePasswordHash(user[0].id, passwordHash);

    // user.passwordHash.hash =
    //     await this.cryptoService.generatePasswordHash(password);
    // await this.usersRepository.save(user);
  }

  // async newPassword(code: string, password: string) {
  //   const user = await this.usersRepository.findByRecoveryCode(code);
  //
  //   if (!user) {
  //     throw BadRequestDomainException.create(
  //         'Incorrect recovery code',
  //         'recoveryCode',
  //     );
  //   }
  //
  //   if (user.passwordHash.expirationDate < new Date()) {
  //     throw BadRequestDomainException.create(
  //         'Recovery code expired',
  //         'recoveryCode',
  //     );
  //   }
  //
  //   user.passwordHash.hash =
  //       await this.cryptoService.generatePasswordHash(password);
  //
  //   await this.usersRepository.save(user);
  // }

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
    const session = await this.authRepository.findSessionByIatAndDeviceId(
      iat,
      deviceId,
    );

    if (!session) {
      throw NotFoundDomainException.create();
    }

    return session;
  }
}
