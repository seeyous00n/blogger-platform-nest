import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeModelType } from './domain/like.entity';
import { Injectable } from '@nestjs/common';
import {
  ExtendedLikesInfo,
  PostLeanDto,
  PostViewDto,
} from '../posts/api/view-dto/post.view-dto';
import {
  CommentLeanDto,
  CommentViewDto,
  LikeInfo,
} from '../comments/api/view-dto/comment-view.dto';
import {
  LikesObjectStructType,
  LikesObjectWithNewestStructType,
} from './types/types';

const LIKE = 'Like';
const DISLIKE = 'Dislike';
const DEFAULT_MY_STATUS = 'None';
const MAX_LIMIT = 3;

@Injectable()
export class LikeHelper {
  constructor(@InjectModel(Like.name) private LikeModel: LikeModelType) {}

  private setLikeInfo(like: Like, likeInfo: LikeInfo, authorId: string) {
    if (like.status === LIKE) {
      likeInfo.likesCount = likeInfo.likesCount + 1;
    }

    if (like.status === DISLIKE) {
      likeInfo.dislikesCount = likeInfo.dislikesCount + 1;
    }

    if (like.authorId === authorId) {
      likeInfo.myStatus = like.status;
    }
  }

  private getLikesInfoWithoutNewest(
    index: string,
    likes: Like[],
    authorId: string | undefined,
  ): LikeInfo {
    const likesMap = new Map<string, LikeInfo>();

    likesMap.set(index, {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: DEFAULT_MY_STATUS,
    });

    const likeInfo = likesMap.get(index);

    for (const like of likes) {
      this.setLikeInfo(like, likeInfo, authorId);
    }

    return likeInfo;
  }

  async getCommentWithLike(
    comment: CommentLeanDto,
    authorId: string | undefined,
  ) {
    const likes = await this.LikeModel.find({
      parentId: comment._id.toString(),
    }).lean<Like[]>();
    const likesInfo = this.getLikesInfoWithoutNewest(
      comment._id.toString(),
      likes,
      authorId,
    );

    return { ...comment, ...likesInfo };
  }

  private getLikesInfoWithoutNewestMany(
    likes: Like[],
    authorId: string | undefined,
  ): LikesObjectStructType {
    const likesMap = new Map<string, LikeInfo>();

    for (const like of likes) {
      if (!likesMap.has(like.parentId)) {
        likesMap.set(like.parentId, {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: DEFAULT_MY_STATUS,
        });
      }

      const likeInfo = likesMap.get(like.parentId);

      this.setLikeInfo(like, likeInfo, authorId);
    }

    return Object.fromEntries(likesMap);
  }

  async getCommentsWithLikes(
    comments: CommentLeanDto[],
    authorId: string | undefined,
  ): Promise<CommentViewDto[]> {
    const commentIdArray = comments.map((comment) => comment._id.toString());
    const likes = await this.LikeModel.find({
      parentId: commentIdArray,
    }).lean();
    const likesStructComments = this.getLikesInfoWithoutNewestMany(
      likes,
      authorId,
    );

    return comments.map((comment) => {
      const likeInfo = likesStructComments[`${comment._id}`]
        ? likesStructComments[`${comment._id}`]
        : {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: DEFAULT_MY_STATUS,
            newestLikes: [],
          };

      const data = { ...comment, ...likeInfo };

      return CommentViewDto.mapToView(data);
    });
  }

  private getLikesInfoWithNewest(
    index: string,
    likes: Like[],
    authorId: string | undefined,
  ): ExtendedLikesInfo {
    return likes.reduce<ExtendedLikesInfo>(
      (accum: ExtendedLikesInfo, currentValue: Like): ExtendedLikesInfo => {
        if (index === currentValue.parentId) {
          if (currentValue.status === LIKE) {
            accum.likesCount += 1;
          }

          if (currentValue.status === DISLIKE) {
            accum.dislikesCount += 1;
          }

          if (currentValue.authorId === authorId) {
            accum.myStatus = currentValue.status;
          }

          if (
            currentValue.isNewLike === 1 &&
            currentValue.status === LIKE &&
            accum.newestLikes.length < MAX_LIMIT
          ) {
            accum.newestLikes.push({
              addedAt: currentValue.createdAt,
              userId: currentValue.authorId,
              login: currentValue.authorLogin,
            });
          }
        }

        return accum;
      },
      {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: DEFAULT_MY_STATUS,
        newestLikes: [],
      },
    );
  }

  async getPostWithLike(post: PostLeanDto, authorId: string | undefined) {
    const likes = await this.LikeModel.find({
      parentId: post._id.toString(),
    })
      .sort({ createdAt: -1 })
      .lean<Like[]>();

    const likesInfoWithNewest = this.getLikesInfoWithNewest(
      post._id.toString(),
      likes,
      authorId,
    );

    return {
      ...post,
      extendedLikesInfo: { ...likesInfoWithNewest },
    };
  }

  private getLikesInfoWithNewestMany(
    likes: Like[],
    authorId: string | undefined,
  ): LikesObjectWithNewestStructType {
    const likesMap = new Map<string, ExtendedLikesInfo>();

    for (const like of likes) {
      if (!likesMap.has(like.parentId)) {
        likesMap.set(like.parentId, {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: DEFAULT_MY_STATUS,
          newestLikes: [],
        });
      }

      const likeInfo = likesMap.get(like.parentId);

      if (like.status === LIKE) {
        likeInfo.likesCount = likeInfo.likesCount + 1;

        if (likeInfo.newestLikes.length < MAX_LIMIT && like.isNewLike === 1) {
          const newest = {
            addedAt: like.createdAt,
            userId: like.authorId,
            login: like.authorLogin,
          };

          likeInfo.newestLikes.push(newest);
        }
      }

      if (like.status === DISLIKE) {
        likeInfo.dislikesCount = likeInfo.dislikesCount + 1;
      }

      if (like.authorId === authorId) {
        likeInfo.myStatus = like.status;
      }
    }

    return Object.fromEntries(likesMap);
  }

  async getPostsWithLikes(posts: PostLeanDto[], authorId: string | undefined) {
    const postIdArray = posts.map((post) => post._id.toString());
    const likes = await this.LikeModel.find({ parentId: postIdArray })
      .sort({ createdAt: -1 })
      .lean<Like[]>();
    const likesStructPost = this.getLikesInfoWithNewestMany(likes, authorId);

    return posts.map((post: PostLeanDto) => {
      const likeInfoWithNewest = likesStructPost[`${post._id}`]
        ? likesStructPost[`${post._id}`]
        : {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: DEFAULT_MY_STATUS,
            newestLikes: [],
          };

      const data = {
        ...post,
        extendedLikesInfo: { ...likeInfoWithNewest },
      };

      return PostViewDto.mapToView(data);
    });
  }
}
