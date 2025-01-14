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
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exception';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getAll(@Query() query: GetPostsQueryParams) {
    return this.postsQueryRepository.getAll(query);
  }

  @Post()
  async create(@Body() body: CreatePostInputDTO) {
    const postId = await this.postsService.createPost(body);
    const post = await this.postsQueryRepository.getByIdOrNotFoundError(postId);
    if (!post) {
      throw NotFoundDomainException.create('blog not found');
    }

    return post;
  }

  @Get(':id/comments')
  async getCommentsByPostId(@Param('id') id: string) {
    // const postId = await this.postsService.getPostId(id);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const post = await this.postsQueryRepository.getByIdOrNotFoundError(id);
    if (!post) {
      throw NotFoundDomainException.create('blog not found');
    }

    return post;
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
