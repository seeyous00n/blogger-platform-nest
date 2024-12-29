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
} from '@nestjs/common';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getAll(@Query() query: GetUsersQueryParams) {
    return await this.usersQueryRepository.getAll(query);
  }

  @Post()
  async create(@Body() body: CreateUserInputDto) {
    const userId = await this.usersService.createUser(body);

    return await this.usersQueryRepository.getByIdOrNotFoundError(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
  }
}
