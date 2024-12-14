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
} from '@nestjs/common';
import { CreateBlogInputDto } from './input-dto/create-blog.input-dto';
import { GetBlogQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CreatePostInputDTO } from './input-dto/create-post.input-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
  ) {}

  @Get()
  async getAll(@Query() query: GetBlogQueryParams) {
    return await this.blogsQueryRepository.getAll(query);
  }

  @Post()
  async create(@Body() body: CreateBlogInputDto) {
    const blogId = await this.blogsService.createBlog(body);
    return await this.blogsQueryRepository.getByIdOrNotFoundError(blogId);
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Query() query: GetPostsQueryParams,
    @Param('id') id: string,
  ) {
    const blogId = await this.blogsService.getBlogId(id);
    return await this.postsQueryRepository.getAll(query, blogId);
  }

  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id') id: string,
    @Body() body: Omit<CreatePostInputDTO, 'blogId'>,
  ) {
    const postId = await this.postsService.createPost({ ...body, blogId: id });
    return await this.postsQueryRepository.getByIdOrNotFoundError(postId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.blogsQueryRepository.getByIdOrNotFoundError(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateBlogInputDto) {
    await this.blogsService.updateBlog(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.blogsService.deleteBlog(id);
  }
}
