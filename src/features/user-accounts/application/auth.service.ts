import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { compareHash } from '../../../core/adapters/bcrypt.service';
import { LoginUserInputDto } from '../api/input-dto/login-user.input-dto';
import { createUuid } from '../../../core/adapters/createUuid.service';
import { CreateTokensInputDto } from '../dto/create-tokens.input-dto';
import { JwtService } from '@nestjs/jwt';
import { SETTINGS } from '../../../core/settings';
import { AuthRepository } from '../infrastructure/auth.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionModelType } from '../domain/session.entity';

type PayloadType = {
  deviceId: string;
  userId: string;
};

type IatAndExpRefreshTokenType = {
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private authRepository: AuthRepository,
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}

  async checkCredentials(data: LoginUserInputDto): Promise<string> {
    const result = await this.usersRepository.findByLoginOrEmail(
      data.loginOrEmail,
    );
    if (!result)
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const isAuth = await compareHash(data.password, result.passwordHash);
    if (!isAuth)
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    return result._id.toString();
  }

  async login(data: CreateTokensInputDto) {
    const deviceId = createUuid();
    const payload = { deviceId, userId: data.userId };
    const tokens = await this.getTokens(payload);
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

  async getTokens(payload: PayloadType) {
    const accessToken = await this.jwtService.signAsync(
      { userId: payload.userId },
      {
        secret: SETTINGS.JWT_ACCESS_SECRET,
        expiresIn: SETTINGS.JWT_REFRESH_TOKEN_EXPIRES,
      },
    );

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: SETTINGS.JWT_REFRESH_SECRET,
      expiresIn: SETTINGS.JWT_REFRESH_TOKEN_EXPIRES,
    });

    return { accessToken, refreshToken };
  }

  getTokenData(token: string): IatAndExpRefreshTokenType {
    const data = this.jwtService.decode(token) as PayloadType &
      IatAndExpRefreshTokenType;

    return { iat: data.iat, exp: data.exp };
  }
}
