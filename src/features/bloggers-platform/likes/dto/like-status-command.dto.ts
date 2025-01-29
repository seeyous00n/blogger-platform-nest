import { MyStatus } from '../domain/like.entity';

export class LikeStatusCommandDto {
  parentId: string;
  authorId: string;
  likeStatus: MyStatus;
}
