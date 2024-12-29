import { Test, TestingModule } from '@nestjs/testing';
import { GetBlogQueryParams } from '../src/features/bloggers-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingController } from '../src/features/testing/testing.controller';

const data = {
  name: 'blogName 1',
  description: 'blogDescription 1',
  websiteUrl: 'https://websiteur1.com',
};

describe('BlogsController', () => {
  let app: INestApplication;
  let testingController: TestingController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    testingController = moduleFixture.get<TestingController>(TestingController);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );

    await app.init();
  });

  beforeEach(async () => {
    await testingController.deleteAll();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /blogs', () => {
    it('should return [] with pagination', async () => {
      const query = {} as GetBlogQueryParams;

      const response = await request(app.getHttpServer())
        .get('/blogs')
        .query(query);

      expect(response.status).toBe(200);
      expect(response.body.pagesCount).toBe(0);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.totalCount).toBe(0);
      expect(response.body.items).toStrictEqual([]);
    });

    it('should return blogs ([]) with pagination (page and pageSize)', async () => {
      const query = { pageNumber: 2, pageSize: 4 } as GetBlogQueryParams;

      const response = await request(app.getHttpServer())
        .get('/blogs')
        .query(query);

      expect(response.status).toBe(200);
      expect(response.body.pagesCount).toBe(0);
      expect(response.body.page).toBe(2);
      expect(response.body.pageSize).toBe(4);
      expect(response.body.totalCount).toBe(0);
      expect(response.body.items).toStrictEqual([]);
    });
  });

  describe('POST /blogs', () => {
    it('should create new blog', async () => {
      const result = await request(app.getHttpServer())
        .post('/blogs')
        .send(data)
        .expect(201);

      const newEntity = result.body;

      expect(typeof newEntity.id).toBe('string');
      expect(newEntity.name).toBe(data.name);
      expect(newEntity.description).toBe(data.description);
      expect(newEntity.websiteUrl).toBe(data.websiteUrl);
      expect(new Date(newEntity.createdAt).toString()).not.toBe('Invalid Date');
      expect(typeof newEntity.isMembership).toBe('boolean');

      // const query = {} as GetBlogQueryParams;
      // const response = await request(app.getHttpServer())
      //   .get('/blogs')
      //   .query(query)
      //   .expect(200);

      // expect(response.body.pagesCount).toBe(1);
      // expect(response.body.page).toBe(1);
      // expect(response.body.pageSize).toBe(10);
      // expect(response.body.totalCount).toBe(1);
      // expect(response.body.items.length).toBe(1);
      //
      // const blogsItems = response.body.items[0];
      //
      // expect(typeof blogsItems.id).toBe('string');
      // expect(blogsItems.name).toBe('blogName 1');
      // expect(blogsItems.description).toBe('blogDescription 1');
      // expect(blogsItems.websiteUrl).toBe('https://websiteur1.com');
      // expect(new Date(blogsItems.createdAt).toString()).not.toBe(
      //   'Invalid Date',
      // );
      // expect(typeof blogsItems.isMembership).toBe('boolean');
    });
  });

  describe('DELETE /blogs', () => {
    it('should delete blog', async () => {
      const result = await request(app.getHttpServer())
        .post('/blogs')
        .send(data)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/blogs/${result.body.id}`)
        .expect(204);
    });
  });
});
