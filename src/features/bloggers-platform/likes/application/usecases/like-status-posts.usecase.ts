import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { LikeStatusCommandDto } from '../../dto/like-status-command.dto';
import { NotFoundDomainException } from '../../../../../core/exceptions/domain-exception';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';
import { Like, LikeModelType } from '../../domain/like.entity';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { LikeStatusBase } from './like-status-base';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

export class LikeStatusPostsCommand {
  constructor(public dto: LikeStatusCommandDto) {}
}

@CommandHandler(LikeStatusPostsCommand)
export class LikeStatusPostsUseCase
  extends LikeStatusBase
  implements ICommandHandler<LikeStatusPostsCommand, void>
{
  constructor(
    @InjectModel(Like.name) LikeModel: LikeModelType,
    private postsRepository: PostsRepository,
    usersRepository: UsersRepository,
    likesRepository: LikesRepository,
  ) {
    super(LikeModel, likesRepository, usersRepository);
  }

  async isEntityExistsOrError(parentId: string) {
    const post = await this.postsRepository.findById(parentId);
    if (!post) {
      throw NotFoundDomainException.create();
    }
  }
}
