import { MyStatus } from '../domain/like.sql-entity';

export class CreateLikeDto {
  likeStatus: MyStatus;
  authorId: string;
  parentId: string;
  authorLogin: string;
}
