import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { LikeStatusCommandDto } from '../../dto/like-status-command.dto';
import { NotFoundDomainException } from '../../../../../core/exceptions/domain-exception';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';
import { Like, LikeModelType } from '../../domain/like.entity';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { LikeStatusBase } from './like-status-base';

export class LikeStatusCommentsCommand {
  constructor(public dto: LikeStatusCommandDto) {}
}

@CommandHandler(LikeStatusCommentsCommand)
export class LikeStatusCommentsUseCase
  extends LikeStatusBase
  implements ICommandHandler<LikeStatusCommentsCommand, void>
{
  constructor(
    @InjectModel(Like.name) LikeModel: LikeModelType,
    private commentsRepository: CommentsRepository,
    usersRepository: UsersRepository,
    likesRepository: LikesRepository,
  ) {
    super(LikeModel, likesRepository, usersRepository);
  }

  async isEntityExistsOrError(parentId: string) {
    const comment = await this.commentsRepository.findById(parentId);
    if (!comment) {
      throw NotFoundDomainException.create();
    }
  }
}
