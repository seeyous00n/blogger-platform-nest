import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GetPostsQueryParams } from '../src/features/bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { deleteAllData } from './helpers/delete-all-data';
import { initSettings } from './helpers/init-settings';
import { newBlogData, newPostData } from './mock/mock-data';

describe('PostsController', () => {
  let app: INestApplication;
  let httpServer;

  beforeEach(async () => {
    const result = await initSettings();

    app = result.app;
    httpServer = result.httpServer;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /posts', () => {
    it('should return [] with pagination', async () => {
      const query = {} as GetPostsQueryParams;
      const response = await request(httpServer)
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
      const newBlog = await request(httpServer)
        .post('/blogs')
        .send(newBlogData)
        .expect(201);

      const result = await request(httpServer)
        .post('/posts')
        .send({ ...newPostData, blogId: newBlog.body.id })
        .expect(201);

      const newEntity = result.body;

      expect(typeof newEntity.id).toBe('string');
      expect(newEntity.title).toBe(newPostData.title);
      expect(newEntity.shortDescription).toBe(newPostData.shortDescription);
      expect(newEntity.content).toBe(newPostData.content);
      expect(newEntity.blogId).toBe(newBlog.body.id);
      expect(newEntity.blogName).toBe(newBlog.body.name);
      expect(new Date(newEntity.createdAt).toString()).not.toBe('Invalid Date');

      const query = {} as GetPostsQueryParams;
      await request(httpServer)
        .get(`/posts/${newEntity.id}`)
        .query(query)
        .expect(200);

      await request(httpServer)
        .get(`/posts`)
        .query({ sortBy: 'blogName' })
        .expect(200);
    });
  });

  describe('DELETE /posts', () => {
    it('should delete a post', async () => {
      const newBlog = await request(httpServer)
        .post('/blogs')
        .send(newBlogData)
        .expect(201);

      const result = await request(httpServer)
        .post('/posts')
        .send({ ...newPostData, blogId: newBlog.body.id })
        .expect(201);

      await request(httpServer).delete(`/posts/${result.body.id}`).expect(204);
    });
  });
});
