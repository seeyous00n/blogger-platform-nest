import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreatePostInputDTO } from '../../src/features/bloggers-platform/posts/api/input-dto/create-post.input-dto';
import { PostViewDto } from '../../src/features/bloggers-platform/posts/api/view-dto/post.view-dto';
import { authBasicData } from '../mock/mock-data';
import { UpdatePostInputDto } from '../../src/features/bloggers-platform/posts/api/input-dto/update-post.input-dto';
import { GetPostsQueryParams } from '../../src/features/bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto';

export class PostTestManager {
  constructor(private app: INestApplication) {}

  async createPost(
    model: CreatePostInputDTO,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer())
      .post('/posts')
      .auth(authBasicData.login, authBasicData.password)
      .send(model)
      .expect(statusCode);

    return response.body;
  }

  async updatePost(
    model: UpdatePostInputDto,
    id: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .post(`/posts/${id}`)
      .auth(authBasicData.login, authBasicData.password)
      .send(model)
      .expect(statusCode);
  }

  async deletePost(
    id: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .delete(`/posts/${id}`)
      .auth(authBasicData.login, authBasicData.password)
      .expect(statusCode);
  }

  async getPosts(
    queryString?: GetPostsQueryParams,
    statusCode: number = HttpStatus.OK,
  ) {
    const response = await request(this.app.getHttpServer())
      .get('/posts')
      .query(queryString)
      .expect(statusCode);

    return response.body;
  }

  async createSeveralPosts(
    blogId: string,
    count: number,
  ): Promise<PostViewDto[]> {
    const posts: Promise<PostViewDto>[] = [];

    for (let i = 0; i < count; i++) {
      const post = this.createPost({
        title: `postTitle${i}`,
        shortDescription: `postShortDescription${i}`,
        content: `postContent${i}`,
        blogId: blogId,
      });

      posts.push(post);
    }

    return await Promise.all(posts);
  }
}
