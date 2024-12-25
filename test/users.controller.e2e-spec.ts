import { INestApplication } from '@nestjs/common';
import { TestingController } from '../src/features/testing/testing.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { GetUsersQueryParams } from '../src/features/user-accounts/api/input-dto/get-users-query-params-input.dto';
import * as request from 'supertest';

const data = {
  login: 'userlogin1',
  password: 'userpassword1',
  email: 'email1@example.com',
};

describe('UsersController', () => {
  let app: INestApplication;
  let testingController: TestingController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    testingController = moduleFixture.get<TestingController>(TestingController);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await testingController.deleteAll();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('should return [] with pagination', async () => {
      const query = {} as GetUsersQueryParams;
      const response = await request(app.getHttpServer())
        .get('/users')
        .query(query);

      expect(response.status).toBe(200);
      expect(response.body.pagesCount).toBe(0);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.totalCount).toBe(0);
      expect(response.body.items).toStrictEqual([]);
    });
  });

  describe('POST /users', () => {
    it('should create new user', async () => {
      const result = await request(app.getHttpServer())
        .post('/users')
        .send(data)
        .expect(201);

      const newEntity = result.body;
      expect(typeof newEntity.id).toBe('string');
      expect(newEntity.login).toBe(data.login);
      expect(newEntity.email).toBe(data.email);
      expect(new Date(newEntity.createdAt).toString()).not.toBe('Invalid Date');
    });
  });

  describe('DELETE /users', () => {
    it('should delete a user', async () => {
      const result = await request(app.getHttpServer())
        .post('/users')
        .send(data)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/users/${result.body.id}`)
        .expect(204);
    });
  });
});
