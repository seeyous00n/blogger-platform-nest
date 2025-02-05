import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UpdateCommentInputDto } from './input-dto/update-comment.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exception';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/jwt-optional-auth.guard';
import { userIdFromParam } from '../../../../core/decorators/userId-from-request.param.decorator';
import { JwtAuthGuard } from '../../../user-accounts/guards/jwt-auth.guard';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';
import { LikeStatusInputDto } from '../../likes/dto/like-status.input-dto';
import { LikeStatusCommentsCommand } from '../../likes/application/usecases/like-status-comments.usecase';
import { SkipThrottle } from '@nestjs/throttler';
import { CommentsSqlQueryRepository } from '../infrastructure/query/comments.sql-query-repository';

@SkipThrottle()
@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private commentsSqlQueryRepository: CommentsSqlQueryRepository,
  ) {}

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getOne(
    @Param('id') id: string,
    @userIdFromParam() userId: string | null,
  ) {
    const comment = await this.commentsSqlQueryRepository.getById(id, userId);
    if (!comment) {
      throw NotFoundDomainException.create();
    }

    return comment;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') commentId: string,
    @Body() body: UpdateCommentInputDto,
    @userIdFromParam() userId: string,
  ) {
    const data = {
      userId,
      commentId,
      content: body.content,
    };

    await this.commandBus.execute(new UpdateCommentCommand(data));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') commentId: string,
    @userIdFromParam() userId: string,
  ) {
    const data = {
      commentId,
      userId,
    };

    await this.commandBus.execute(new DeleteCommentCommand(data));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatus(
    @Param('id') parentId: string,
    @Body() body: LikeStatusInputDto,
    @userIdFromParam() userId: string,
  ) {
    const data = {
      parentId,
      authorId: userId,
      likeStatus: body.likeStatus,
    };

    await this.commandBus.execute(new LikeStatusCommentsCommand(data));
  }
}
