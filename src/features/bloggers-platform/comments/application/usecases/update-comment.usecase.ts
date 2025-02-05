import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsService } from '../comments.service';
import { UpdateCommentCommandDto } from '../../dto/update-comment.dto';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql-repository';

export class UpdateCommentCommand {
  constructor(public dto: UpdateCommentCommandDto) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand, void>
{
  constructor(
    private commentsSqlRepository: CommentsSqlRepository,
    private commentsService: CommentsService,
  ) {}

  async execute(command: UpdateCommentCommand) {
    const { commentId, userId, content } = command.dto;
    const comment = await this.commentsService.checkOwnerComment(
      commentId,
      userId,
    );

    comment.update({ content });

    await this.commentsSqlRepository.save(comment);
  }
}
