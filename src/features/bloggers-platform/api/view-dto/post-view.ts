import { PostDocument } from '../../domain/post.entity';
import { MyStatus } from '../../../../core/types/enums';

export type newestLikes = {
  addedAt: Date;
  userId: string;
  login: string;
};

export type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: MyStatus;
  newestLikes: newestLikes[];
};

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo;

  static mapToView(post: PostDocument): PostViewDto {
    const dto = new PostViewDto();
    dto.id = post.id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: MyStatus.None,
      newestLikes: [
        {
          addedAt: post.createdAt,
          userId: 'string',
          login: 'string',
        },
      ],
    };

    return dto;
  }
}
