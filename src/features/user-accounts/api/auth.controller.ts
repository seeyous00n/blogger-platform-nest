import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../application/auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserInputDto } from './input-dto/login-user.input-dto';
import {
  IpAndUserAgent,
  IpAndUserAgentType,
} from '../../../core/decorators/ip-and-user-agent.param.decorator';

const TOKENS_NAME = {
  REFRESH_TOKEN: 'refreshToken',
  ACCESS_TOKEN: 'accessToken',
};

const cookiesData = {
  httpOnly: true,
  secure: true,
  maxAge: 1000 * 60 * 60 * 24,
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
      TOKENS_NAME.REFRESH_TOKEN,
      authData.refreshToken,
      cookiesData,
    );
    return { [TOKENS_NAME.ACCESS_TOKEN]: authData.accessToken };
  }

  @Get()
  async getMe() {}

  @Post('registration')
  async registration(@Body() body: CreateUserDto) {}

  @Post()
  async confirmationEmail() {}

  @Post()
  async resendingEmail() {}

  @Post()
  async refreshToken() {}

  @Post()
  async logout() {}

  @Post()
  async passwordRecovery() {}

  @Post()
  async newPassword() {}
}
