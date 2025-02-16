import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { UsersService } from '../application/users.service';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { BasicAuthGuard } from '../guards/basic-auth.guard';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exception';
import { SkipThrottle } from '@nestjs/throttler';
import { UsersSqlQueryRepository } from '../infrastructure/query/users-sql.query-repository';

@SkipThrottle()
@Controller('sa/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAll(@Query() query: GetUsersQueryParams) {
    return this.usersSqlQueryRepository.getAll(query);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Body() body: CreateUserInputDto) {
    const userId = await this.usersService.createUser(body);
    await this.usersService.updateIsConfirmed(userId);

    const user = await this.usersSqlQueryRepository.getById(userId);
    if (!user) {
      throw NotFoundDomainException.create();
    }

    return user;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
  }
}
