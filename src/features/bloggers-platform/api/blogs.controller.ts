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
import { CreateBlogInputDto } from './input-dto/create-blog-input.dto';
import { GetBlogQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { UpdateBlogInputDto } from './input-dto/update-blog-input.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
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
  async getPostsByBlogId(@Param('id') id: string) {}

  @Post(':id/posts')
  async createPostByBlogId(@Param('id') id: string) {}

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
