import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentInputDto } from '../../api/input-dto/create-comment.input-dto';
import { InjectModel } from '@nestjs/mongoose';
import { CommentModelType, Comment } from '../../domain/comment.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';

export class CreateCommentCommand {
  constructor(public dto: CreateCommentInputDto) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, string>
{
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateCommentCommand) {
    const { postId, userId, content } = command.dto;
    await this.postsRepository.findOneOrNotFoundError(postId);
    const user = await this.usersRepository.findOneOrNotFoundError(userId);
    const comment = this.commentModel.createInstance({
      postId,
      userId,
      content,
      userLogin: user.login,
    });

    await this.commentsRepository.save(comment);

    return comment._id.toString();
  }
}
