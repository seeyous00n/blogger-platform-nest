import { ObjectId } from 'mongoose';
import { DeletionStatus } from '../../../../../core/types/enums';

export class CommentLeanDto {
  _id: ObjectId;
  deletionStatus: DeletionStatus;
  postId: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
}

export class ViewLikeModel extends CommentLeanDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
}

export class LikeInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
}

export class CommentatorInfo {
  userId: string;
  userLogin: string;
}

export class CommentViewDto {
  id: string;
  content: string;
  createdAt: Date;
  commentatorInfo: CommentatorInfo;
  likesInfo: LikeInfo;

  static mapToView(model: ViewLikeModel): CommentViewDto {
    const dto = new CommentViewDto();
    dto.id = model._id.toString();
    dto.content = model.content;
    dto.createdAt = model.createdAt;
    dto.commentatorInfo = model.commentatorInfo;
    dto.likesInfo = {
      likesCount: model.likesCount,
      dislikesCount: model.dislikesCount,
      myStatus: model.myStatus,
    };

    return dto;
  }
}
