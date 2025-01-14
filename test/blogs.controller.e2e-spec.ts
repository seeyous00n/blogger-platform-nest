import { GetBlogQueryParams } from '../src/features/bloggers-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { deleteAllData } from './helpers/delete-all-data';
import { initSettings } from './helpers/init-settings';
import { newBlogData, newPostData } from './mock/mock-data';
import { BlogTestManager } from './helpers/blog-test-manager';

describe('BlogsController', () => {
  let app: INestApplication;
  let httpServer;
  let blogTestManager: BlogTestManager;

  beforeEach(async () => {
    const result = await initSettings();

    app = result.app;
    httpServer = result.httpServer;
    blogTestManager = result.blogTestManager;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /blogs', () => {
    it('should return [] with pagination', async () => {
      const query = {} as GetBlogQueryParams;

      const response = await request(httpServer).get('/blogs').query(query);

      expect(response.status).toBe(200);
      expect(response.body.pagesCount).toBe(0);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.totalCount).toBe(0);
      expect(response.body.items).toStrictEqual([]);
    });

    it('should return blogs (5) with pagination (page and pageSize)', async () => {
      await blogTestManager.createSeveralBlogs(5);
      const query = { pageNumber: 2, pageSize: 4 } as GetBlogQueryParams;
      const blogsWithPagination = await blogTestManager.getBlogs(query);

      expect(blogsWithPagination.pagesCount).toBe(2);
      expect(blogsWithPagination.page).toBe(2);
      expect(blogsWithPagination.pageSize).toBe(4);
      expect(blogsWithPagination.totalCount).toBe(5);
      expect(blogsWithPagination.items.length).toBe(1);
    });
  });

  describe('POST /blogs', () => {
    it('should create new blog', async () => {
      const result = await request(httpServer)
        .post('/blogs')
        .send(newBlogData)
        .expect(201);

      const newEntity = result.body;

      expect(typeof newEntity.id).toBe('string');
      expect(newEntity.name).toBe(newBlogData.name);
      expect(newEntity.description).toBe(newBlogData.description);
      expect(newEntity.websiteUrl).toBe(newBlogData.websiteUrl);
      expect(new Date(newEntity.createdAt).toString()).not.toBe('Invalid Date');
      expect(typeof newEntity.isMembership).toBe('boolean');

      const query = {} as GetBlogQueryParams;
      const blogsWithPagination = await blogTestManager.getBlogs(query);

      expect(blogsWithPagination.pagesCount).toBe(1);
      expect(blogsWithPagination.page).toBe(1);
      expect(blogsWithPagination.pageSize).toBe(10);
      expect(blogsWithPagination.totalCount).toBe(1);
      expect(blogsWithPagination.items.length).toBe(1);

      const blogsItem = blogsWithPagination.items[0];

      expect(typeof blogsItem.id).toBe('string');
      expect(blogsItem.name).toBe(newBlogData.name);
      expect(blogsItem.description).toBe(newBlogData.description);
      expect(blogsItem.websiteUrl).toBe(newBlogData.websiteUrl);
      expect(new Date(blogsItem.createdAt).toString()).not.toBe('Invalid Date');
      expect(typeof blogsItem.isMembership).toBe('boolean');
    });
  });

  describe('DELETE /blogs', () => {
    it('should delete blog', async () => {
      const blog = await blogTestManager.createBlog(newBlogData);

      await request(httpServer).delete(`/blogs/${blog.id}`).expect(204);
    });
  });

  describe('POST /blogs/id/posts', () => {
    it('should create post by blog', async () => {
      const blog = await blogTestManager.createBlog(newBlogData);
      const post = await request(httpServer)
        .post(`/blogs/${blog.id}/posts`)
        .send(newPostData)
        .expect(201);

      const postItem = post.body;

      expect(typeof postItem.id).toBe('string');
      expect(postItem.title).toBe(newPostData.title);
      expect(postItem.shortDescription).toBe(newPostData.shortDescription);
      expect(postItem.content).toBe(newPostData.content);
      expect(postItem.blogId).toBe(blog.id);
      expect(postItem.blogName).toBe(blog.name);
      expect(new Date(postItem.createdAt).toString()).not.toBe('Invalid Date');
    });
  });
});
