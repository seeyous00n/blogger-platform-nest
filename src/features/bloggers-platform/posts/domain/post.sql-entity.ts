import { DeletionStatus } from '../../../user-accounts/domain/user.sql-entity';
import { UpdatePostDto } from '../dto/update-post.dto';
import { CreatePostInstanceSqlDto } from '../dto/sql-dto/create-post-instance.sql-dto';

export const postTitleConstraints = {
  maxLength: 30,
};
export const postShortDescriptionConstraints = {
  maxLength: 100,
};
export const postContentConstraints = {
  maxLength: 1000,
};

export class Post {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  deletionStatus: boolean;
  createdAt: Date;

  static createInstance(data: CreatePostInstanceSqlDto): Post {
    const dto = new Post();
    dto.id = String(data.id);
    dto.title = data.title;
    dto.shortDescription = data.short_description;
    dto.content = data.content;
    dto.blogId = data.blog_id;
    dto.deletionStatus = data.deletion_status;
    dto.createdAt = data.created_at;

    return dto;
  }

  update(dto: Omit<UpdatePostDto, 'blogId'>) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }

  makeDeleted() {
    if (this.deletionStatus !== Boolean(DeletionStatus.NotDeleted)) {
      throw new Error('Entity already deleted');
    }

    this.deletionStatus = Boolean(DeletionStatus.PermanentDeleted);
  }
}
