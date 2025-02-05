import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsService } from '../comments.service';
import { DeleteCommentCommandDto } from '../../dto/delete-comment.dto';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql-repository';

export class DeleteCommentCommand {
  constructor(public dto: DeleteCommentCommandDto) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand, void>
{
  constructor(
    private commentsSqlRepository: CommentsSqlRepository,
    private commentsService: CommentsService,
  ) {}

  async execute(command: DeleteCommentCommand) {
    const { commentId, userId } = command.dto;
    const comment = await this.commentsService.checkOwnerComment(
      commentId,
      userId,
    );

    comment.makeDeleted();

    await this.commentsSqlRepository.save(comment);
  }
}
