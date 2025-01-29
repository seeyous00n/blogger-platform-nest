import { ExtendedLikesInfo } from '../../posts/api/view-dto/post.view-dto';
import { LikeInfo } from '../../comments/api/view-dto/comment-view.dto';

export type LikesObjectWithNewestStructType = {
  [key: string]: ExtendedLikesInfo;
};

export type LikesObjectStructType = {
  [key: string]: LikeInfo;
};
