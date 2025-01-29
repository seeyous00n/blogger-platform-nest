import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentsService } from '../comments.service';
import { UpdateCommentCommandDto } from '../../dto/update-comment.dto';

export class UpdateCommentCommand {
  constructor(public dto: UpdateCommentCommandDto) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand, void>
{
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
    private commentsService: CommentsService,
  ) {}

  async execute(command: UpdateCommentCommand) {
    const { commentId, userId, content } = command.dto;
    const comment = await this.commentsService.checkOwnerComment(
      commentId,
      userId,
    );

    comment.update({ content });

    await this.commentsRepository.save(comment);
  }
}
