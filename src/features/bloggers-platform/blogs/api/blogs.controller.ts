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
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { CreatePostByBlogInputDTO } from '../../posts/api/input-dto/create-post.input-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exception';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation-pipe.service';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/jwt-optional-auth.guard';
import { userIdFromParam } from '../../../../core/decorators/userId-from-request.param.decorator';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
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
    return this.blogsQueryRepository.getAll(query);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Body() body: CreateBlogInputDto) {
    const blogId = await this.blogsService.createBlog(body);
    const blog = await this.blogsQueryRepository.getById(blogId);

    if (!blog) {
      throw NotFoundDomainException.create();
    }

    return blog;
  }

  @Get(':id/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsByBlogId(
    @Query() query: GetPostsQueryParams,
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @userIdFromParam() userId: string | null,
  ) {
    const blogId = await this.blogsService.getBlogId(id);
    return this.postsQueryRepository.getAll(query, userId, blogId);
  }

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @Body() body: CreatePostByBlogInputDTO,
  ) {
    const postId = await this.postsService.createPost({ ...body, blogId: id });
    const result = await this.postsQueryRepository.getById(postId);

    if (!result) {
      throw NotFoundDomainException.create();
    }

    return result;
  }

  @Get(':id')
  async getOne(@Param('id', new ObjectIdValidationPipe()) id: string) {
    const blog = await this.blogsQueryRepository.getById(id);
    if (!blog) {
      throw NotFoundDomainException.create();
    }

    return blog;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @Body() dto: UpdateBlogInputDto,
  ) {
    await this.blogsService.updateBlog(id, dto);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', new ObjectIdValidationPipe()) id: string) {
    await this.blogsService.deleteBlog(id);
  }
}
