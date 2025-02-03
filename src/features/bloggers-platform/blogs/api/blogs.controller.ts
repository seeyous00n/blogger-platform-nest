import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetBlogQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { BlogsService } from '../application/blogs.service';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exception';
import { userIdFromParam } from '../../../../core/decorators/userId-from-request.param.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { BlogsSqlQueryRepository } from '../infrastructure/query/blogs-sql.query-repository';
import { PostsSqlQueryRepository } from '../../posts/infrastructure/query/posts-sql.query-repository';

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsSqlQueryRepository: BlogsSqlQueryRepository,
    private postsSqlQueryRepository: PostsSqlQueryRepository,
  ) {}

  @Get()
  async getAll(@Query() query: GetBlogQueryParams) {
    return this.blogsSqlQueryRepository.getAll(query);
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Query() query: GetPostsQueryParams,
    @Param('id') id: string,
    @userIdFromParam() userId: string | null,
  ) {
    const blogId = await this.blogsService.getBlogId(id);
    return this.postsSqlQueryRepository.getAll(query, userId, blogId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const blog = await this.blogsSqlQueryRepository.getById(id);
    if (!blog) {
      throw NotFoundDomainException.create();
    }

    return blog;
  }
}
