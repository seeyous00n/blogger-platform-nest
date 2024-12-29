import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingController } from '../src/features/testing/testing.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { GetPostsQueryParams } from '../src/features/bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto';

const data = {
  title: 'title1',
  shortDescription: 'short description1',
  content: 'content 1',
};

const dataBlog = {
  name: 'blogName 1',
  description: 'blogDescription 1',
  websiteUrl: 'https://websiteur1.com',
};

describe('PostsController', () => {
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

  describe('GET /posts', () => {
    it('should return [] with pagination', async () => {
      const query = {} as GetPostsQueryParams;
      const response = await request(app.getHttpServer())
        .get('/posts')
        .query(query)
        .expect(200);

      expect(response.body.pagesCount).toBe(0);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.totalCount).toBe(0);
      expect(response.body.items).toStrictEqual([]);
    });
  });

  describe('POST /posts', () => {
    it('should create new post', async () => {
      const newBlog = await request(app.getHttpServer())
        .post('/blogs')
        .send(dataBlog)
        .expect(201);

      const result = await request(app.getHttpServer())
        .post('/posts')
        .send({ ...data, blogId: newBlog.body.id })
        .expect(201);

      const newEntity = result.body;

      expect(typeof newEntity.id).toBe('string');
      expect(newEntity.title).toBe(data.title);
      expect(newEntity.shortDescription).toBe(data.shortDescription);
      expect(newEntity.content).toBe(data.content);
      expect(newEntity.blogId).toBe(newBlog.body.id);
      expect(newEntity.blogName).toBe(newBlog.body.name);
      expect(new Date(newEntity.createdAt).toString()).not.toBe('Invalid Date');

      const query = {} as GetPostsQueryParams;
      await request(app.getHttpServer())
        .get(`/posts/${newEntity.id}`)
        .query(query)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/posts`)
        .query({ sortBy: 'blogName' })
        .expect(200);
    });
  });

  describe('DELETE /posts', () => {
    it('should delete a post', async () => {
      const newBlog = await request(app.getHttpServer())
        .post('/blogs')
        .send(dataBlog)
        .expect(201);

      const result = await request(app.getHttpServer())
        .post('/posts')
        .send({ ...data, blogId: newBlog.body.id })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/posts/${result.body.id}`)
        .expect(204);
    });
  });
});
