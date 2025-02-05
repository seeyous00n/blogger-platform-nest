import { MyStatus } from '../../domain/like.sql-entity';

export class CreateLikeSqlDto {
  likeStatus: MyStatus;
  authorId: string;
  parentId: string;
  isNewLike: number;
}
