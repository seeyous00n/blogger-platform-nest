import { HttpStatus, INestApplication } from '@nestjs/common';
import { GetUsersQueryParams } from '../src/features/user-accounts/api/input-dto/get-users-query-params.input-dto';
import * as request from 'supertest';
import { deleteAllData } from './helpers/delete-all-data';
import { initSettings } from './helpers/init-settings';
import { authBasicData, newUserData } from './mock/mock-data';
import { UserTestManager } from './helpers/user-test-manager';

describe('UsersController', () => {
  let app: INestApplication;
  let httpServer;
  let userTestManager: UserTestManager;

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    httpServer = result.httpServer;
    userTestManager = result.userTestManager;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should create new user | code 201', async () => {
      const user = await userTestManager.createUser(newUserData);

      expect(typeof user.id).toBe('string');
      expect(user.login).toBe(newUserData.login);
      expect(user.email).toBe(newUserData.email);
      expect(new Date(user.createdAt).toString()).not.toBe('Invalid Date');
    });

    it('should return error message | field - user', async () => {
      const response = await request(app.getHttpServer())
        .post('/sa/users')
        .auth(authBasicData.login, authBasicData.password)
        .send({ ...newUserData, login: 'sm' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.errorsMessages[0].field).toBe('login');
    });
  });

  describe('GET /users', () => {
    it('should return [] with pagination', async () => {
      const query = {} as GetUsersQueryParams;
      const users = await userTestManager.getUsers(query);

      expect(users.pagesCount).toBe(0);
      expect(users.page).toBe(1);
      expect(users.pageSize).toBe(10);
      expect(users.totalCount).toBe(0);
      expect(users.items).toStrictEqual([]);
    });

    it('should return users with pagination', async () => {
      const query = { pageNumber: 2, pageSize: 2 } as GetUsersQueryParams;

      await userTestManager.createSeveralUsers(5);
      const usersWithPagination = await userTestManager.getUsers(query);

      expect(usersWithPagination.pagesCount).toBe(3);
      expect(usersWithPagination.page).toBe(2);
      expect(usersWithPagination.pageSize).toBe(2);

      expect(usersWithPagination.totalCount).toBe(5);
      expect(usersWithPagination.items.length).toBe(2);
    });

    it('should create 5 users and delete first user, result with pagination', async () => {
      const users = await userTestManager.createSeveralUsers(5);

      await request(httpServer)
        .delete(`/sa/users/${users[0].id}`)
        .auth(authBasicData.login, authBasicData.password)
        .expect(HttpStatus.NO_CONTENT);

      const usersWithPagination = await userTestManager.getUsers();

      expect(usersWithPagination.totalCount).toBe(4);
      expect(usersWithPagination.items.length).toBe(4);
    });
  });

  describe('DELETE /users', () => {
    it('should delete a user', async () => {
      const user = await userTestManager.createUser(newUserData);

      await request(httpServer)
        .delete(`/sa/users/${user.id}`)
        .auth(authBasicData.login, authBasicData.password)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return code 400, when attempting to delete', async () => {
      await request(httpServer)
        .delete(`/sa/users/312`)
        .auth(authBasicData.login, authBasicData.password)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
