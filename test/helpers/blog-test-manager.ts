import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateBlogInputDto } from '../../src/features/bloggers-platform/blogs/api/input-dto/create-blog.input-dto';
import { BlogSqlViewDto } from '../../src/features/bloggers-platform/blogs/api/view-dto/blog.view-dto';
import * as request from 'supertest';
import { authBasicData } from '../mock/mock-data';
import { UpdateBlogInputDto } from '../../src/features/bloggers-platform/blogs/api/input-dto/update-blog.input-dto';
import { CreatePostByBlogInputDTO } from '../../src/features/bloggers-platform/posts/api/input-dto/create-post.input-dto';
import { PostViewDto } from '../../src/features/bloggers-platform/posts/api/view-dto/post.view-dto';
import { GetBlogQueryParams } from '../../src/features/bloggers-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { PaginationViewDto } from '../../src/core/dto/base.paginated.view-dto';

export class BlogTestManager {
  constructor(private app: INestApplication) {}

  async createBlog(
    model: CreateBlogInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<BlogSqlViewDto> {
    const response = await request(this.app.getHttpServer())
      .post('/sa/blogs')
      .auth(authBasicData.login, authBasicData.password)
      .send(model)
      .expect(statusCode);

    return response.body;
  }

  async updateBlog(
    model: UpdateBlogInputDto,
    id: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .put(`/sa/blogs/${id}`)
      .auth(authBasicData.login, authBasicData.password)
      .send(model)
      .expect(statusCode);
  }

  async deleteBlog(
    id: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .delete(`/sa/blogs/${id}`)
      .auth(authBasicData.login, authBasicData.password)
      .expect(statusCode);
  }

  async createPostByBlogId(
    blogId: string,
    model: CreatePostByBlogInputDTO,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/sa/blogs/${blogId}/posts`)
      .auth(authBasicData.login, authBasicData.password)
      .send(model)
      .expect(statusCode);

    return response.body;
  }

  async getBlogs(
    queryString?: GetBlogQueryParams,
    statusCode: number = HttpStatus.OK,
  ): Promise<PaginationViewDto<BlogSqlViewDto[]>> {
    const response = await request(this.app.getHttpServer())
      .get('/blogs')
      .query(queryString)
      .expect(statusCode);

    return response.body;
  }

  async createSeveralBlogs(count: number): Promise<BlogSqlViewDto[]> {
    const blogs: Promise<BlogSqlViewDto>[] = [];

    for (let i = 0; i < count; i++) {
      const blog = this.createBlog({
        name: `blogName${i}`,
        description: `blogDescription${i}`,
        websiteUrl: `websiteurl${i}.com`,
      });

      blogs.push(blog);
    }

    return await Promise.all(blogs);
  }
}
