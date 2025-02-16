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
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { userIdFromParam } from '../../../core/decorators/userId-from-request.param.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteSessionCommand } from '../application/usecases/delete-session.usecase';
import { DeleteSessionsCommand } from '../application/usecases/delete-sessions.usecase';
import { Request } from 'express';
import { tokensName } from '../types/types';
import { SkipThrottle } from '@nestjs/throttler';
import { SecuritySqlQueryRepository } from '../infrastructure/query/security-sql.query-repository';

@SkipThrottle()
@Controller('security')
export class SecurityController {
  constructor(
    private securitySqlQueryRepository: SecuritySqlQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(JwtRefreshAuthGuard)
  @Get('devices')
  async getDevices(@userIdFromParam() userId: string) {
    return this.securitySqlQueryRepository.getAllDevices(userId);
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
