import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentInputDto } from '../../api/input-dto/create-comment.input-dto';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql-repository';
import { PostsSqlRepository } from '../../../posts/infrastructure/posts-sql.repository';
import { UsersSqlRepository } from '../../../../user-accounts/infrastructure/users-sql.repository';
import { NotFoundDomainException } from '../../../../../core/exceptions/domain-exception';

export class CreateCommentCommand {
  constructor(public dto: CreateCommentInputDto) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, string>
{
  constructor(
    private commentsSqlRepository: CommentsSqlRepository,
    private postsSqlRepository: PostsSqlRepository,
    private usersSqlRepository: UsersSqlRepository,
  ) {}

  async execute(command: CreateCommentCommand) {
    const { postId, userId, content } = command.dto;
    const post = await this.postsSqlRepository.findById(postId);
    if (!post) throw NotFoundDomainException.create();

    const user = await this.usersSqlRepository.findById(userId);
    if (!user) throw NotFoundDomainException.create();

    const comment = await this.commentsSqlRepository.create({
      postId,
      userId,
      content,
    });

    return comment.id;
  }
}
