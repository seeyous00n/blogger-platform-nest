import { ObjectId } from 'mongoose';
import { DeletionStatus } from '../../../../../core/types/enums';

export class PostLeanDto {
  _id: ObjectId;
  deletionStatus: DeletionStatus;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
}

export class NewestLikes {
  addedAt: Date;
  userId: string;
  login: string;
}

export class ExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: NewestLikes[];
}

export class PostViewForMapType {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  _id: ObjectId;
  extendedLikesInfo: ExtendedLikesInfo;
}

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo;

  static mapToView(post: PostViewForMapType): PostViewDto {
    const dto = new PostViewDto();
    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = post.extendedLikesInfo;

    return dto;
  }
}

export class PostSqlDto {
  id: string;
  title: string;
  short_description: string;
  content: string;
  blog_id: string;
  blog_name: string;
  created_at: Date;
}

export class PostSqlViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo;

  static mapToView(post: PostSqlDto): PostSqlViewDto {
    const dto = new PostSqlViewDto();
    dto.id = String(post.id);
    dto.title = post.title;
    dto.shortDescription = post.short_description;
    dto.content = post.content;
    dto.blogId = String(post.blog_id);
    dto.blogName = post.blog_name;
    dto.createdAt = post.created_at;
    dto.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    };

    return dto;
  }
}
