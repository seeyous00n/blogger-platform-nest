import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { deleteAllData } from './helpers/delete-all-data';
import { initSettings } from './helpers/init-settings';
import {
  newBlogData,
  newPostData,
  newUserData,
  updateCommentData,
} from './mock/mock-data';
import { BlogTestManager } from './helpers/blog-test-manager';
import { PostTestManager } from './helpers/post-test-manager';
import { UserTestManager } from './helpers/user-test-manager';
import { CommentTestManager } from './helpers/comment-test-manager';

describe('CommentController', () => {
  let app: INestApplication;
  let httpServer;
  let blogTestManager: BlogTestManager;
  let postTestManager: PostTestManager;
  let userTestManager: UserTestManager;
  let commentTestManager: CommentTestManager;
  let dataSource;

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    httpServer = result.httpServer;
    blogTestManager = result.blogTestManager;
    postTestManager = result.postTestManager;
    userTestManager = result.userTestManager;
    commentTestManager = result.commentTestManager;
    dataSource = result.dataSource;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /comments/id', () => {
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

    it('should return comment', async () => {
      const comments = await commentTestManager.createSeveralComments(
        newPost.id,
        3,
        accessToken,
      );

      const result = await request(httpServer)
        .get(`/comments/${comments[1].id}`)
        .expect(HttpStatus.OK);

      expect(result.body.id).toBe(comments[1].id);
      expect(result.body.content).toBe(comments[1].content);
      expect(result.body.commentatorInfo.userId).toBe(
        comments[1].commentatorInfo.userId,
      );
    });
  });

  describe('PUT /comments/:id', () => {
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

    it('should update comment', async () => {
      const comments = await commentTestManager.createSeveralComments(
        newPost.id,
        3,
        accessToken,
      );

      await request(httpServer)
        .put(`/comments/${comments[1].id}`)
        .auth(accessToken, { type: 'bearer' })
        .send(updateCommentData)
        .expect(HttpStatus.NO_CONTENT);

      const comment = await request(httpServer)
        .get(`/comments/${comments[1].id}`)
        .expect(HttpStatus.OK);

      expect(comment.body.content).toBe(updateCommentData.content);
    });
  });

  describe('DELETE /comments/:id', () => {
    let newPost;
    let accessToken;
    let comments;
    let users;

    beforeEach(async () => {
      const newBlog = await blogTestManager.createBlog(newBlogData);
      newPost = await postTestManager.createPost({
        ...newPostData,
        blogId: newBlog.id,
      });
      users = await userTestManager.createSeveralUsers(3);

      accessToken = await userTestManager.loginUser({
        loginOrEmail: users[0].login,
        password: newUserData.password,
      });

      comments = await commentTestManager.createSeveralComments(
        newPost.id,
        3,
        accessToken,
      );
    });

    it('should delete comment', async () => {
      await request(httpServer)
        .delete(`/comments/${comments[1].id}`)
        .auth(accessToken, { type: 'bearer' })
        .expect(HttpStatus.NO_CONTENT);

      const comment = await request(httpServer)
        .get(`/comments/${comments[1].id}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(comment.body.message).toBe('Not Found');
    });

    it('should return code 401', async () => {
      await request(httpServer)
        .delete(`/comments/${comments[1].id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return code 403', async () => {
      const anotherAccessToken = await userTestManager.loginUser({
        loginOrEmail: users[1].login,
        password: newUserData.password,
      });

      await request(httpServer)
        .delete(`/comments/${comments[1].id}`)
        .auth(anotherAccessToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return code 404', async () => {
      await request(httpServer)
        .delete(`/comments/123`)
        .auth(accessToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PUT /comments/:id/like-status', () => {
    let newPost;
    let accessToken;
    let comments;
    let users;

    beforeEach(async () => {
      const newBlog = await blogTestManager.createBlog(newBlogData);
      newPost = await postTestManager.createPost({
        ...newPostData,
        blogId: newBlog.id,
      });
      users = await userTestManager.createSeveralUsers(3);

      accessToken = await userTestManager.loginUser({
        loginOrEmail: users[0].login,
        password: newUserData.password,
      });

      comments = await commentTestManager.createSeveralComments(
        newPost.id,
        3,
        accessToken,
      );
    });

    it('should put the like ', async () => {
      await request(httpServer)
        .put(`/comments/${comments[0].id}/like-status`)
        .auth(accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HttpStatus.NO_CONTENT);

      const likeData = await dataSource.query(
        `SELECT *
         FROM "like"
         WHERE author_id = $1
           AND parent_id = $2`,
        [users[0].id, comments[0].id],
      );

      expect(likeData[0].status).toBe('Like');
      expect(likeData[0].is_new_like).toBe(1);

      const comment = await request(httpServer)
        .get(`/comments/${comments[0].id}`)
        .auth(accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK);

      expect(comment.body.likesInfo.likesCount).toBe(1);
      expect(comment.body.likesInfo.myStatus).toBe('Like');

      const commentNotAuthUser = await request(httpServer)
        .get(`/comments/${comments[0].id}`)
        .expect(HttpStatus.OK);

      expect(commentNotAuthUser.body.likesInfo.likesCount).toBe(1);
      expect(commentNotAuthUser.body.likesInfo.myStatus).toBe('None');
    });

    it('should return 400', async () => {
      const result = await request(httpServer)
        .put(`/comments/${comments[0].id}/like-status`)
        .auth(accessToken, { type: 'bearer' })
        .send({ likeStatus: 'asd' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(result.body.errorsMessages[0].field).toBe('likeStatus');
    });

    it('should return 401', async () => {
      await request(httpServer)
        .put(`/comments/${comments[0].id}/like-status`)
        .send({ likeStatus: 'Like' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 404', async () => {
      await request(httpServer)
        .put(`/comments/123/like-status`)
        .auth(accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
