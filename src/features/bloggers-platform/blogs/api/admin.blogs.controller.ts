import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateBlogInputDto } from './input-dto/create-blog.input-dto';
import { GetBlogQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { BlogsService } from '../application/blogs.service';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { PostsService } from '../../posts/application/posts.service';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { CreatePostByBlogInputDTO } from '../../posts/api/input-dto/create-post.input-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exception';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/jwt-optional-auth.guard';
import { userIdFromParam } from '../../../../core/decorators/userId-from-request.param.decorator';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { BlogsSqlQueryRepository } from '../infrastructure/query/blogs-sql.query-repository';
import { PostsSqlQueryRepository } from '../../posts/infrastructure/query/posts-sql.query-repository';

@SkipThrottle()
@Controller('sa/blogs')
export class AdminBlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsSqlQueryRepository: BlogsSqlQueryRepository,
    private postsSqlQueryRepository: PostsSqlQueryRepository,
    private postsService: PostsService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAll(@Query() query: GetBlogQueryParams) {
    return this.blogsSqlQueryRepository.getAll(query);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Body() body: CreateBlogInputDto) {
    const blogId = await this.blogsService.createBlog(body);
    const blog = await this.blogsSqlQueryRepository.getById(blogId);

    if (!blog) {
      throw NotFoundDomainException.create();
    }

    return blog;
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id/posts')
  async getPostsByBlogId(
    @Query() query: GetPostsQueryParams,
    @Param('id') id: string,
    @userIdFromParam() userId: string | null,
  ) {
    const blogId = await this.blogsService.getBlogId(id);
    return this.postsSqlQueryRepository.getAll(query, userId, blogId);
  }

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id') id: string,
    @Body() body: CreatePostByBlogInputDTO,
  ) {
    const postId = await this.postsService.createPost({ ...body, blogId: id });
    const result = await this.postsSqlQueryRepository.getById(postId);

    if (!result) {
      throw NotFoundDomainException.create();
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateBlogInputDto) {
    await this.blogsService.updateBlog(id, dto);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostByBlogId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() body: CreatePostByBlogInputDTO,
  ) {
    const data = { ...body, blogId };
    await this.blogsService.getBlogId(blogId);
    await this.postsService.updatePost(postId, data);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlogId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ) {
    await this.blogsService.getBlogId(blogId);
    await this.postsService.deletePost(postId);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.blogsService.deleteBlog(id);
  }
}
