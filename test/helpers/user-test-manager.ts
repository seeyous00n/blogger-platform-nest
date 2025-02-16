import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateUserInputDto } from '../../src/features/user-accounts/api/input-dto/create-user.input-dto';
import * as request from 'supertest';
import { authBasicData, newUserData } from '../mock/mock-data';
import { UserSqlViewDto } from '../../src/features/user-accounts/api/view-dto/user.view-dto';
import { PaginationViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../src/features/user-accounts/api/input-dto/get-users-query-params.input-dto';
import { LoginUserInputDto } from '../../src/features/user-accounts/api/input-dto/login-user.input-dto';

export class UserTestManager {
  constructor(private app: INestApplication) {}

  async createUser(
    model: CreateUserInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<UserSqlViewDto> {
    const response = await request(this.app.getHttpServer())
      .post('/sa/users')
      .auth(authBasicData.login, authBasicData.password)
      .send(model)
      .expect(statusCode);

    return response.body;
  }

  async getUsers(
    queryString?: GetUsersQueryParams,
    statusCode: number = HttpStatus.OK,
  ): Promise<PaginationViewDto<UserSqlViewDto[]>> {
    const response = await request(this.app.getHttpServer())
      .get('/sa/users')
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
      .delete(`/sa/users/${id}`)
      .auth(authBasicData.login, authBasicData.password)
      .expect(statusCode);
  }

  async createSeveralUsers(count: number): Promise<UserSqlViewDto[]> {
    const users: Promise<UserSqlViewDto>[] = [];

    for (let i = 0; i < count; i++) {
      const user = this.createUser({
        login: `userlogin${i}`,
        password: newUserData.password,
        email: `email${i}@example.com`,
      });

      users.push(user);
    }

    return await Promise.all(users);
  }

  async loginUser(
    model: LoginUserInputDto,
    statusCode: number = HttpStatus.OK,
  ): Promise<string> {
    const result = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: model.loginOrEmail,
        password: model.password,
      })
      .expect(statusCode);

    return result.body.accessToken;
  }

  //TODO make one method loginUser, return access and refresh tokens
  async loginUserGetTwoTokens(
    model: LoginUserInputDto,
    statusCode: number = HttpStatus.OK,
  ) {
    const result = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: model.loginOrEmail,
        password: model.password,
      })
      .expect(statusCode);

    return {
      accessToken: result.body.accessToken,
      refreshToken: result.headers['set-cookie'][0].split(';')[0],
    };
  }

  async registrationUser(
    model: CreateUserInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .post('/auth/registration')
      .send(model)
      .expect(statusCode);
  }
}
