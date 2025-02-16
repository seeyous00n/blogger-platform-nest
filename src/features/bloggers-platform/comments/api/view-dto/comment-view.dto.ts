import { ObjectId } from 'mongoose';
import { DeletionStatus } from '../../../../../core/types/enums';
import { CommentSearchResultSqlDto } from '../../dto/sql-dto/comment-search-result.sql-dto';

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

export class CommentSqlViewDto {
  id: string;
  content: string;
  createdAt: Date;
  commentatorInfo: CommentatorInfo;
  likesInfo: LikeInfo;

  static mapToView(model: CommentSearchResultSqlDto): CommentSqlViewDto {
    const dto = new CommentSqlViewDto();
    dto.id = String(model.id);
    dto.content = model.content;
    dto.createdAt = model.created_at;
    dto.commentatorInfo = {
      userId: String(model.user_id),
      userLogin: model.user_login,
    };
    dto.likesInfo = {
      likesCount: Number(model.likes_count),
      dislikesCount: Number(model.dislikes_count),
      myStatus: model.my_status ? model.my_status : 'None',
    };

    return dto;
  }
}
