import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatusCommandDto } from '../../dto/like-status-command.dto';
import { NotFoundDomainException } from '../../../../../core/exceptions/domain-exception';
import { LikeStatusBase } from './like-status-base';
import { UsersSqlRepository } from '../../../../user-accounts/infrastructure/users-sql.repository';
import { LikesSqlRepository } from '../../infrastructure/likes.sql-repository';
import { CommentsSqlRepository } from '../../../comments/infrastructure/comments.sql-repository';

export class LikeStatusCommentsCommand {
  constructor(public dto: LikeStatusCommandDto) {}
}

@CommandHandler(LikeStatusCommentsCommand)
export class LikeStatusCommentsUseCase
  extends LikeStatusBase
  implements ICommandHandler<LikeStatusCommentsCommand, void>
{
  constructor(
    private commentsSqlRepository: CommentsSqlRepository,
    usersSqlRepository: UsersSqlRepository,
    likesSqlRepository: LikesSqlRepository,
  ) {
    super(likesSqlRepository, usersSqlRepository);
  }

  async isEntityExistsOrError(parentId: string) {
    const comment = await this.commentsSqlRepository.findById(parentId);
    if (!comment) {
      throw NotFoundDomainException.create();
    }
  }
}
