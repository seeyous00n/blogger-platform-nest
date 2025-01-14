import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateUserInputDto } from '../../src/features/user-accounts/api/input-dto/create-user.input-dto';
import * as request from 'supertest';
import { authBasicData } from '../mock/mock-data';
import { UserViewDto } from '../../src/features/user-accounts/api/view-dto/user.view-dto';
import { PaginationViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../src/features/user-accounts/api/input-dto/get-users-query-params.input-dto';

export class UserTestManager {
  constructor(private app: INestApplication) {}

  async createUser(
    model: CreateUserInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .post('/users')
      .auth(authBasicData.login, authBasicData.password)
      .send(model)
      .expect(statusCode);

    return response.body;
  }

  async getUsers(
    queryString?: GetUsersQueryParams,
    statusCode: number = HttpStatus.OK,
  ): Promise<PaginationViewDto<UserViewDto[]>> {
    const response = await request(this.app.getHttpServer())
      .get('/users')
      .auth(authBasicData.login, authBasicData.password)
      .query(queryString)
      .expect(statusCode);

    return response.body;
  }

  async deleteUser(
    id: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .delete(`/users/${id}`)
      .auth(authBasicData.login, authBasicData.password)
      .expect(statusCode);
  }

  async createSeveralUsers(count: number): Promise<UserViewDto[]> {
    const users: Promise<UserViewDto>[] = [];

    for (let i = 0; i < count; i++) {
      const user = this.createUser({
        login: `userlogin${i}`,
        password: 'userpassword',
        email: `email${i}@example.com`,
      });

      users.push(user);
    }

    return await Promise.all(users);
  }
}
