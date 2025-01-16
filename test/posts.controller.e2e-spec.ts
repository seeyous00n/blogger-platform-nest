import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GetPostsQueryParams } from '../src/features/bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { deleteAllData } from './helpers/delete-all-data';
import { initSettings } from './helpers/init-settings';
import { newBlogData, newPostData } from './mock/mock-data';
import { BlogTestManager } from './helpers/blog-test-manager';
import { PostTestManager } from './helpers/post-test-manager';

describe('PostsController', () => {
  let app: INestApplication;
  let httpServer;
  let blogTestManager: BlogTestManager;
  let postTestManager: PostTestManager;

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    httpServer = result.httpServer;
    blogTestManager = result.blogTestManager;
    postTestManager = result.postTestManager;
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
        .expect(HttpStatus.OK);

      expect(response.body.pagesCount).toBe(0);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.totalCount).toBe(0);
      expect(response.body.items).toStrictEqual([]);
    });
  });

  describe('POST /posts', () => {
    it('should create new post', async () => {
      const newBlog = await blogTestManager.createBlog(newBlogData);

      const result = await request(httpServer)
        .post('/posts')
        .send({ ...newPostData, blogId: newBlog.id })
        .expect(HttpStatus.CREATED);

      const newEntity = result.body;

      expect(typeof newEntity.id).toBe('string');
      expect(newEntity.title).toBe(newPostData.title);
      expect(newEntity.shortDescription).toBe(newPostData.shortDescription);
      expect(newEntity.content).toBe(newPostData.content);
      expect(newEntity.blogId).toBe(newBlog.id);
      expect(newEntity.blogName).toBe(newBlog.name);
      expect(new Date(newEntity.createdAt).toString()).not.toBe('Invalid Date');
    });
  });

  describe('DELETE /posts', () => {
    it('should delete a post', async () => {
      const newBlog = await blogTestManager.createBlog(newBlogData);

      const result = await request(httpServer)
        .post('/posts')
        .send({ ...newPostData, blogId: newBlog.id })
        .expect(HttpStatus.CREATED);

      await request(httpServer).delete(`/posts/${result.body.id}`).expect(204);
    });
  });
});
