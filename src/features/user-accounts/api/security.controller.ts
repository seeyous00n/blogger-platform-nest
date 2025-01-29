import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SecurityQueryRepository } from '../infrastructure/query/security.query-repository';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { userIdFromParam } from '../../../core/decorators/userId-from-request.param.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteSessionCommand } from '../application/usecases/delete-session.usecase';
import { DeleteSessionsCommand } from '../application/usecases/delete-sessions.usecase';
import { Request } from 'express';
import { tokensName } from '../types/types';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('security')
export class SecurityController {
  constructor(
    private securityQueryRepository: SecurityQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(JwtRefreshAuthGuard)
  @Get('devices')
  async getDevices(@userIdFromParam() userId: string) {
    return this.securityQueryRepository.getAllDevices(userId);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Delete('devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevice(
    @Param('id') deviceId: string,
    @userIdFromParam() userId: string,
  ) {
    const data = { deviceId, userId };
    await this.commandBus.execute(new DeleteSessionCommand(data));
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevices(@Req() request: Request) {
    const refreshToken = request.cookies[tokensName.refreshToken];
    await this.commandBus.execute(new DeleteSessionsCommand(refreshToken));
  }
}
