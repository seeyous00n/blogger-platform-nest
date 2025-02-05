import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatusCommandDto } from '../../dto/like-status-command.dto';
import { NotFoundDomainException } from '../../../../../core/exceptions/domain-exception';
import { LikeStatusBase } from './like-status-base';
import { UsersSqlRepository } from '../../../../user-accounts/infrastructure/users-sql.repository';
import { LikesSqlRepository } from '../../infrastructure/likes.sql-repository';
import { PostsSqlRepository } from '../../../posts/infrastructure/posts-sql.repository';

export class LikeStatusPostsCommand {
  constructor(public dto: LikeStatusCommandDto) {}
}

@CommandHandler(LikeStatusPostsCommand)
export class LikeStatusPostsUseCase
  extends LikeStatusBase
  implements ICommandHandler<LikeStatusPostsCommand, void>
{
  constructor(
    private postsSqlRepository: PostsSqlRepository,
    usersSqlRepository: UsersSqlRepository,
    likesSqlRepository: LikesSqlRepository,
  ) {
    super(likesSqlRepository, usersSqlRepository);
  }

  async isEntityExistsOrError(parentId: string) {
    const post = await this.postsSqlRepository.findById(parentId);
    if (!post) {
      throw NotFoundDomainException.create();
    }
  }
}
