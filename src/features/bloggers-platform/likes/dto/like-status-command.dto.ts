import { MyStatus } from '../domain/like.sql-entity';

export class LikeStatusCommandDto {
  parentId: string;
  authorId: string;
  likeStatus: MyStatus;
}
