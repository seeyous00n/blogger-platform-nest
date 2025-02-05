import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GetPostsQueryParams } from '../src/features/bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { deleteAllData } from './helpers/delete-all-data';
import { initSettings } from './helpers/init-settings';
import {
  authBasicData,
  newBlogData,
  newCommentData,
  newPostData,
  newUserData,
} from './mock/mock-data';
import { BlogTestManager } from './helpers/blog-test-manager';
import { PostTestManager } from './helpers/post-test-manager';
import { UserTestManager } from './helpers/user-test-manager';
import { CommentTestManager } from './helpers/comment-test-manager';

describe('PostsController', () => {
  let app: INestApplication;
  let httpServer;
  let blogTestManager: BlogTestManager;
  let postTestManager: PostTestManager;
  let userTestManager: UserTestManager;
  let commentTestManager: CommentTestManager;
  let dbConnection;
  let dataSource;

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    httpServer = result.httpServer;
    blogTestManager = result.blogTestManager;
    postTestManager = result.postTestManager;
    userTestManager = result.userTestManager;
    commentTestManager = result.commentTestManager;
    dbConnection = result.dbConnection;
    dataSource = result.dataSource;
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

    it('should return new posts with pagination + login', async () => {
      const query = {} as GetPostsQueryParams;
      const newBlog = await blogTestManager.createBlog(newBlogData);

      await postTestManager.createSeveralPosts(newBlog.id, 5);
      await userTestManager.createUser(newUserData);

      const accessToken = await userTestManager.loginUser({
        loginOrEmail: newUserData.login,
        password: newUserData.password,
      });

      const response = await request(httpServer)
        .get('/posts')
        .auth(accessToken, { type: 'bearer' })
        .query(query)
        .expect(HttpStatus.OK);

      expect(response.body.pagesCount).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.totalCount).toBe(5);
      expect(response.body.items.length).toBe(5);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return new posts with pagination + without login', async () => {
      const query = {} as GetPostsQueryParams;
      const newBlog = await blogTestManager.createBlog(newBlogData);
      const newPost = await postTestManager.createPost({
        ...newPostData,
        blogId: newBlog.id,
      });

      await request(httpServer)
        .get(`/posts/${newPost.id}`)
        .query(query)
        .expect(HttpStatus.OK);
    });

    it('should return post with pagination + login', async () => {
      const query = {} as GetPostsQueryParams;
      const newBlog = await blogTestManager.createBlog(newBlogData);
      const newPost = await postTestManager.createPost({
        ...newPostData,
        blogId: newBlog.id,
      });

      await userTestManager.createUser(newUserData);

      const accessToken = await userTestManager.loginUser({
        loginOrEmail: newUserData.login,
        password: newUserData.password,
      });

      await request(httpServer)
        .get(`/posts/${newPost.id}`)
        .auth(accessToken, { type: 'bearer' })
        .query(query)
        .expect(HttpStatus.OK);
    });
  });

  describe('POST /posts', () => {
    it('should create new post', async () => {
      const newBlog = await blogTestManager.createBlog(newBlogData);

      const result = await request(httpServer)
        .post('/posts')
        .auth(authBasicData.login, authBasicData.password)
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
        .auth(authBasicData.login, authBasicData.password)
        .send({ ...newPostData, blogId: newBlog.id })
        .expect(HttpStatus.CREATED);

      await request(httpServer)
        .delete(`/posts/${result.body.id}`)
        .auth(authBasicData.login, authBasicData.password)
        .expect(204);
    });
  });

  describe('POST /posts/id/comments', () => {
    let newPost;
    let accessToken;

    beforeEach(async () => {
      const newBlog = await blogTestManager.createBlog(newBlogData);
      newPost = await postTestManager.createPost({
        ...newPostData,
        blogId: newBlog.id,
      });
      await userTestManager.createUser(newUserData);

      accessToken = await userTestManager.loginUser({
        loginOrEmail: newUserData.login,
        password: newUserData.password,
      });
    });

    it('should create new comment', async () => {
      await request(httpServer)
        .post(`/posts/${newPost.id}/comments`)
        .auth(accessToken, { type: 'bearer' })
        .send(newCommentData)
        .expect(HttpStatus.CREATED);
    });

    it('should return 404', async () => {
      const result = await request(httpServer)
        .post(`/posts/${newPost.id}/comments`)
        .auth(accessToken, { type: 'bearer' })
        .send({ content: 'short comment' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(result.body.errorsMessages[0].field).toBe('content');
    });
  });

  describe('GET /posts/id/comments', () => {
    let newPost;
    let accessToken;

    beforeEach(async () => {
      const newBlog = await blogTestManager.createBlog(newBlogData);
      newPost = await postTestManager.createPost({
        ...newPostData,
        blogId: newBlog.id,
      });
      await userTestManager.createUser(newUserData);

      accessToken = await userTestManager.loginUser({
        loginOrEmail: newUserData.login,
        password: newUserData.password,
      });
    });

    it('should return comments with pagination', async () => {
      await commentTestManager.createSeveralComments(
        newPost.id,
        11,
        accessToken,
      );

      const result = await request(httpServer)
        .get(`/posts/${newPost.id}/comments`)
        .expect(HttpStatus.OK);

      expect(result.body.pagesCount).toBe(2);
      expect(result.body.page).toBe(1);
      expect(result.body.pageSize).toBe(10);
      expect(result.body.totalCount).toBe(11);
      expect(result.body.items.length).toBe(10);
    });
  });

  describe('PUT /posts/:id/like-status', () => {
    let posts;
    let accessToken;
    let users;

    beforeEach(async () => {
      const newBlog = await blogTestManager.createBlog(newBlogData);
      users = await userTestManager.createSeveralUsers(3);

      accessToken = await userTestManager.loginUser({
        loginOrEmail: users[0].login,
        password: newUserData.password,
      });

      posts = await postTestManager.createSeveralPosts(newBlog.id, 3);
    });

    it('should put the like ', async () => {
      await request(httpServer)
        .put(`/posts/${posts[0].id}/like-status`)
        .auth(accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HttpStatus.NO_CONTENT);

      const likeData = await dataSource.query(
        `SELECT *
         FROM "like"
         WHERE author_id = $1
           AND parent_id = $2`,
        [users[0].id, posts[0].id],
      );

      expect(likeData[0].status).toBe('Like');
      expect(likeData[0].is_new_like).toBe(1);

      const post = await request(httpServer)
        .get(`/posts/${posts[0].id}`)
        .auth(accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK);

      expect(post.body.extendedLikesInfo.likesCount).toBe(1);
      expect(post.body.extendedLikesInfo.myStatus).toBe('Like');
      expect(post.body.extendedLikesInfo.newestLikes[0].userId).toBe(
        users[0].id,
      );

      const postNotAuthUser = await request(httpServer)
        .get(`/posts/${posts[0].id}`)
        .expect(HttpStatus.OK);

      expect(postNotAuthUser.body.extendedLikesInfo.likesCount).toBe(1);
      expect(postNotAuthUser.body.extendedLikesInfo.myStatus).toBe('None');
    });

    it('should return 400', async () => {
      const result = await request(httpServer)
        .put(`/posts/${posts[0].id}/like-status`)
        .auth(accessToken, { type: 'bearer' })
        .send({ likeStatus: 'asd' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(result.body.errorsMessages[0].field).toBe('likeStatus');
    });

    it('should return 401', async () => {
      await request(httpServer)
        .put(`/posts/${posts[0].id}/like-status`)
        .send({ likeStatus: 'Like' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 404', async () => {
      await request(httpServer)
        .put(`/posts/123/like-status`)
        .auth(accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
