import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../application/auth.service';
import { LoginUserInputDto } from './input-dto/login-user.input-dto';
import {
  IpAndUserAgent,
  IpAndUserAgentType,
} from '../../../core/decorators/ip-and-user-agent.param.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { userIdFromParam } from '../../../core/decorators/userId-from-request.param.decorator';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { UserViewAuthDto } from './view-dto/user.view-dto';
import { UsersService } from '../application/users.service';
import { ConfirmationCodeInputDto } from './input-dto/confirmation-code.input-dto';
import { EmailInputDto } from './input-dto/email.input-dto';
import { NewPasswordInputDto } from './input-dto/new-password.input-dto';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exception';
import { tokensName } from '../types/types';
import { getCookiesDataUtils } from '../../../core/utils/getCookiesData.utils';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { LogoutCommand } from '../application/usecases/logout.usecese';
import { RefreshTokenCommand } from '../application/usecases/refresh-token.usecese';
import { SkipThrottle } from '@nestjs/throttler';
import { UsersSqlQueryRepository } from '../infrastructure/query/users-sql.query-repository';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @IpAndUserAgent() ipAndUserAgent: IpAndUserAgentType,
    @Res({ passthrough: true }) response: Response,
    @Body() body: LoginUserInputDto,
  ) {
    const userId = await this.authService.checkCredentials(body);
    const data = {
      userId,
      ip: ipAndUserAgent.ip,
      title: ipAndUserAgent.userAgent,
    };

    const authData = await this.authService.login(data);

    response.cookie(
      tokensName.refreshToken,
      authData.refreshToken,
      getCookiesDataUtils(),
    );

    return { [tokensName.accessToken]: authData.accessToken };
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@userIdFromParam() userId: string): Promise<UserViewAuthDto> {
    const user =
      this.usersQueryRepository.getAuthUserByIdOrNotFoundError(userId);
    if (!user) {
      throw NotFoundDomainException.create();
    }

    return user;
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserInputDto) {
    const userId = await this.usersService.createUser(body);
    await this.authService.registration(userId);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmationEmail(@Body() body: ConfirmationCodeInputDto) {
    await this.authService.confirmation(body.code);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendingEmail(@Body() body: EmailInputDto) {
    await this.authService.resending(body.email);
  }

  @SkipThrottle()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = request.cookies[tokensName.refreshToken];
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new RefreshTokenCommand(token),
    );

    response.cookie(
      tokensName.refreshToken,
      refreshToken,
      getCookiesDataUtils(),
    );

    return { [tokensName.accessToken]: accessToken };
  }

  @SkipThrottle()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() request: Request) {
    const refreshToken = request.cookies[tokensName.refreshToken];
    await this.commandBus.execute(new LogoutCommand(refreshToken));
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: EmailInputDto) {
    await this.authService.recovery(body.email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordInputDto) {
    await this.authService.newPassword(body.recoveryCode, body.newPassword);
  }
}
