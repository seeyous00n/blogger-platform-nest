import { NotFoundDomainException } from '../../../../../core/exceptions/domain-exception';
import { LikeStatusCommandDto } from '../../dto/like-status-command.dto';
import { LikesSqlRepository } from '../../infrastructure/likes.sql-repository';
import { UsersSqlRepository } from '../../../../user-accounts/infrastructure/users-sql.repository';
import { MyStatus } from '../../domain/like.sql-entity';

class LikeStatusCommand {
  constructor(public dto: LikeStatusCommandDto) {}
}

export abstract class LikeStatusBase {
  protected constructor(
    private likesSqlRepository: LikesSqlRepository,
    private usersSqlRepository: UsersSqlRepository,
  ) {}

  async execute(command: LikeStatusCommand) {
    const { parentId, authorId, likeStatus } = command.dto;

    await this.isEntityExistsOrError(parentId);
    await this.isUserExistsOrError(authorId);

    const like = await this.likesSqlRepository.findOne({ parentId, authorId });
    if (!like) {
      await this.likesSqlRepository.create({
        parentId,
        authorId,
        likeStatus,
        isNewLike: likeStatus === MyStatus.Like ? 1 : 0,
      });

      return;
    }

    if (likeStatus !== like.status) {
      like.status = likeStatus;
    }

    await this.likesSqlRepository.save(like);
  }

  async isUserExistsOrError(authorId: string) {
    const user = await this.usersSqlRepository.findById(authorId);
    if (!user) {
      throw NotFoundDomainException.create();
    }
  }

  abstract isEntityExistsOrError(parentId: string): Promise<any>;
}
