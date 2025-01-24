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
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { CreatePostInputDTO } from './input-dto/create-post.input-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exception';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation-pipe.service';
import { CreateCommentByPostInputDTO } from '../../comments/api/input-dto/create-comment.input-dto';
import { JwtAuthGuard } from '../../../user-accounts/guards/jwt-auth.guard';
import { userIdFromParam } from '../../../../core/decorators/userId-from-request.param.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { CommentsQueryRepository } from '../../comments/infrastructure/query/comments.query-repository';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/jwt-optional-auth.guard';
import { GetCommentsQueryParams } from '../../comments/api/input-dto/get-comments-query-params.input-dto';
import { LikeStatusInputDto } from '../../likes/dto/like-status.input-dto';
import { LikeStatusPostsCommand } from '../../likes/application/usecases/like-status-posts.usecase';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getAll(
    @Query() query: GetPostsQueryParams,
    @userIdFromParam() userId: string | null,
  ) {
    return this.postsQueryRepository.getAll(query, userId);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Body() body: CreatePostInputDTO) {
    const postId = await this.postsService.createPost(body);
    const post = await this.postsQueryRepository.getById(postId);
    if (!post) {
      throw NotFoundDomainException.create();
    }

    return post;
  }

  @Get(':id/comments')
  @UseGuards(JwtOptionalAuthGuard)
  async getCommentsByPostId(
    @Param('id') id: string,
    @Query() query: GetCommentsQueryParams,
    @userIdFromParam() userId: string | null,
  ) {
    const postId = await this.postsService.getPostId(id);
    return this.commentsQueryRepository.getAll(query, userId, postId);
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getOne(
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @userIdFromParam() userId: string | null,
  ) {
    const post = await this.postsQueryRepository.getById(id, userId);
    if (!post) {
      throw NotFoundDomainException.create();
    }

    return post;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @Body() dto: UpdatePostInputDto,
  ) {
    await this.postsService.updatePost(id, dto);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', new ObjectIdValidationPipe()) id: string) {
    await this.postsService.deletePost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  async createCommentByPostId(
    @Body() body: CreateCommentByPostInputDTO,
    @Param('id') id: string,
    @userIdFromParam() userId: string,
  ) {
    const data = {
      userId,
      postId: id,
      content: body.content,
    };
    const commentId = await this.commandBus.execute(
      new CreateCommentCommand(data),
    );

    return this.commentsQueryRepository.getById(commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatus(
    @Param('id', new ObjectIdValidationPipe()) parentId: string,
    @Body() body: LikeStatusInputDto,
    @userIdFromParam() userId: string,
  ) {
    const data = {
      parentId,
      authorId: userId,
      likeStatus: body.likeStatus,
    };

    await this.commandBus.execute(new LikeStatusPostsCommand(data));
  }
}
