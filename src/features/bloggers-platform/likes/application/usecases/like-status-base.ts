import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeModelType } from '../../domain/like.entity';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { NotFoundDomainException } from '../../../../../core/exceptions/domain-exception';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';
import { LikeStatusCommandDto } from '../../dto/like-status-command.dto';

class LikeStatusCommand {
  constructor(public dto: LikeStatusCommandDto) {}
}

export abstract class LikeStatusBase {
  protected constructor(
    @InjectModel(Like.name) private LikeModel: LikeModelType,
    private likesRepository: LikesRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: LikeStatusCommand) {
    const { parentId, authorId, likeStatus } = command.dto;

    await this.isEntityExistsOrError(parentId);
    const authorLogin = await this.getUserOrError(authorId);

    const like = await this.likesRepository.findOne({ parentId, authorId });
    if (!like) {
      const newLike = this.LikeModel.createInstance({
        parentId,
        authorId,
        likeStatus,
        authorLogin,
      });

      await this.likesRepository.save(newLike);
      return;
    }

    if (likeStatus !== like.status) {
      like.status = likeStatus;
    }

    await this.likesRepository.save(like);
  }

  async getUserOrError(authorId: string) {
    const user = await this.usersRepository.findById(authorId);
    if (!user) {
      throw NotFoundDomainException.create();
    }

    return user.login;
  }

  abstract isEntityExistsOrError(parentId: string): Promise<any>;
}
