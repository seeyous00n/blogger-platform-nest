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
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { CreatePostInputDTO } from './input-dto/create-post.input-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getAll(@Query() query: GetPostsQueryParams) {
    return await this.postsQueryRepository.getAll(query);
  }

  @Post()
  async create(@Body() body: CreatePostInputDTO) {
    const postId = await this.postsService.createPost(body);
    return await this.postsQueryRepository.getByIdOrNotFoundError(postId);
  }

  @Get(':id/comments')
  async getCommentsByPostId(@Param('id') id: string) {
    // const postId = await this.postsService.getPostId(id);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.postsQueryRepository.getByIdOrNotFoundError(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdatePostInputDto) {
    await this.postsService.updatePost(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.postsService.deletePost(id);
  }
}
