import { MyStatus } from '../domain/like.entity';

export class CreateLikeDto {
  likeStatus: MyStatus;
  authorId: string;
  parentId: string;
  authorLogin: string;
}
