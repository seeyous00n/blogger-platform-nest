import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentsService } from '../comments.service';
import { DeleteCommentCommandDto } from '../../dto/delete-comment.dto';

export class DeleteCommentCommand {
  constructor(public dto: DeleteCommentCommandDto) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand, void>
{
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
    private commentsService: CommentsService,
  ) {}

  async execute(command: DeleteCommentCommand) {
    const { commentId, userId } = command.dto;
    const comment = await this.commentsService.checkOwnerComment(
      commentId,
      userId,
    );

    comment.makeDeleted();

    await this.commentsRepository.save(comment);
  }
}
