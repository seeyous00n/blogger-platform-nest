import { Test, TestingModule } from '@nestjs/testing';
import { GetBlogQueryParams } from '../src/features/bloggers-platform/api/input-dto/get-blogs-query-params.input-dto';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestingController } from '../src/features/testing/testing.controller';

describe('BlogsController', () => {
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

  afterEach(async () => {
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
        .query(query)
        .expect(200);

      // expect(response.status).toBe(200);
      expect(response.body.pagesCount).toBe(0);
      expect(response.body.page).toBe(2);
      expect(response.body.pageSize).toBe(4);
      expect(response.body.totalCount).toBe(0);
      expect(response.body.items).toStrictEqual([]);
    });
  });

  describe('POST /blogs', () => {
    it('should create new blog', async () => {
      const data = {
        name: 'blogName 1',
        description: 'blogDescription 1',
        websiteUrl: 'https://jdfef.com',
      };
      await request(app.getHttpServer()).post('/blogs').send(data).expect(201);

      const query = {} as GetBlogQueryParams;
      const response2 = await request(app.getHttpServer())
        .get('/blogs')
        .query(query)
        .expect(200);

      expect(response2.body.pagesCount).toBe(1);
      expect(response2.body.page).toBe(1);
      expect(response2.body.pageSize).toBe(10);
      expect(response2.body.totalCount).toBe(1);
      expect(response2.body.items.length).toBe(1);

      const blogsItems = response2.body.items[0];

      expect(typeof blogsItems.id).toBe('string');
      expect(blogsItems.name).toBe('blogName 1');
      expect(blogsItems.description).toBe('blogDescription 1');
      expect(blogsItems.websiteUrl).toBe('https://jdfef.com');
      expect(new Date(blogsItems.createdAt).toString()).not.toBe(
        'Invalid Date',
      );
      expect(typeof blogsItems.isMembership).toBe('boolean');
    });
  });
});
