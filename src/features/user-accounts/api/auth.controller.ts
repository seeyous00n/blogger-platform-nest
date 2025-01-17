import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
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
import { getCookiesData } from '../../../core/adapters/getCookiesData';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
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
      getCookiesData(),
    );

    return { [tokensName.accessToken]: authData.accessToken };
  }

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

  @Post()
  async refreshToken() {}

  @Post()
  async logout() {}

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
