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
import { CreateBlogInputDTO } from './input-dto/create-blog.input-dto';
import { GetBlogQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { BloggerService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { UpdateBlogInputDTO } from './input-dto/update-blog.input-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogService: BloggerService,
    private blogQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  async getAll(@Query() query: GetBlogQueryParams) {
    return await this.blogQueryRepository.getAll(query);
  }

  @Post()
  async create(@Body() body: CreateBlogInputDTO) {
    const blogId = await this.blogService.createBlog(body);
    return await this.blogQueryRepository.getByIdOrNotFoundError(blogId);
  }

  @Get(':id/posts')
  async getPostsByBlogId(@Param('id') id: string) {}

  @Post(':id/posts')
  async createPostByBlogId(@Param('id') id: string) {}

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.blogQueryRepository.getByIdOrNotFoundError(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateBlogInputDTO) {
    await this.blogService.updateBlog(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.blogService.deleteBlog(id);
  }
}
