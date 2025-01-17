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
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { BasicAuthGuard } from '../guards/basic-auth.guard';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation-pipe.service';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exception';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAll(@Query() query: GetUsersQueryParams) {
    return this.usersQueryRepository.getAll(query);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Body() body: CreateUserInputDto) {
    const userId = await this.usersService.createUser(body);
    await this.usersService.updateIsConfirmed(userId);

    const user = await this.usersQueryRepository.getByIdOrNotFoundError(userId);
    if (!user) {
      throw NotFoundDomainException.create();
    }

    return user;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', new ObjectIdValidationPipe()) id: string) {
    await this.usersService.deleteUser(id);
  }
}
