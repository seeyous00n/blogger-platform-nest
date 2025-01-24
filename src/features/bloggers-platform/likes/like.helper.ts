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

  private getLikesInfoWithoutNewest(
    index: string,
    likes: Like[],
    authorId: string | undefined,
  ): LikeInfo {
    return likes.reduce<LikeInfo>(
      (accum: LikeInfo, currentValue: Like): LikeInfo => {
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
        }

        return accum;
      },
      { likesCount: 0, dislikesCount: 0, myStatus: DEFAULT_MY_STATUS },
    );
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
    return likes.reduce<LikesObjectStructType>(
      (accum: LikesObjectStructType, currentValue): LikesObjectStructType => {
        if (`${currentValue.parentId}` in accum) {
          if (currentValue.status === LIKE) {
            accum[`${currentValue.parentId}`].likesCount += 1;
          }

          if (currentValue.status === DISLIKE) {
            accum[`${currentValue.parentId}`].dislikesCount += 1;
          }

          if (currentValue.authorId === authorId) {
            accum[`${currentValue.parentId}`].myStatus = currentValue.status;
          }

          return accum;
        }

        accum[`${currentValue.parentId}`] = {
          likesCount: currentValue.status === LIKE ? 1 : 0,
          dislikesCount: currentValue.status === DISLIKE ? 1 : 0,
          myStatus:
            currentValue.authorId === authorId
              ? currentValue.status
              : DEFAULT_MY_STATUS,
        };

        return accum;
      },
      {} as LikesObjectStructType,
    );
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
    //TODO для создания объектов такой структуры нужно использовать Map!!
    return likes.reduce<LikesObjectWithNewestStructType>(
      (
        accum: LikesObjectWithNewestStructType,
        currentValue,
      ): LikesObjectWithNewestStructType => {
        if (`${currentValue.parentId}` in accum) {
          if (currentValue.status === LIKE) {
            accum[`${currentValue.parentId}`].likesCount += 1;

            if (
              accum[`${currentValue.parentId}`].newestLikes.length <
                MAX_LIMIT &&
              currentValue.isNewLike === 1
            ) {
              const newest = {
                addedAt: currentValue.createdAt,
                userId: currentValue.authorId,
                login: currentValue.authorLogin,
              };

              accum[`${currentValue.parentId}`].newestLikes.push(newest);
            }
          }

          if (currentValue.status === DISLIKE) {
            accum[`${currentValue.parentId}`].dislikesCount += 1;
          }

          if (currentValue.authorId === authorId) {
            accum[`${currentValue.parentId}`].myStatus = currentValue.status;
          }

          return accum;
        }

        accum[`${currentValue.parentId}`] = {
          likesCount: currentValue.status === LIKE ? 1 : 0,
          dislikesCount: currentValue.status === DISLIKE ? 1 : 0,
          myStatus:
            currentValue.authorId === authorId
              ? currentValue.status
              : DEFAULT_MY_STATUS,
          newestLikes: [],
        };

        const newest =
          currentValue.status === LIKE && currentValue.isNewLike === 1
            ? {
                addedAt: currentValue.createdAt,
                userId: currentValue.authorId,
                login: currentValue.authorLogin,
              }
            : null;

        if (newest) {
          accum[`${currentValue.parentId}`].newestLikes.push(newest);
        }

        return accum;
      },
      {} as LikesObjectWithNewestStructType,
    );
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
