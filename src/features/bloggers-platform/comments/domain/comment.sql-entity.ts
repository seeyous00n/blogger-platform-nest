import { CreateCommentInstanceSqlDto } from '../dto/sql-dto/create-comment-Instance.sql-dto';
import { DeletionStatus } from '../../../user-accounts/domain/user.sql-entity';
import { UpdateCommentDto } from '../dto/update-comment.dto';

export const commentConstraints = {
  minLength: 20,
  maxLength: 300,
};

export class Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  deletionStatus: boolean;
  createdAt: Date;

  static createInstance(data: CreateCommentInstanceSqlDto): Comment {
    const dto = new Comment();
    dto.id = String(data.id);
    dto.userId = data.user_id;
    dto.postId = data.post_id;
    dto.content = data.content;
    dto.deletionStatus = data.deletion_status;
    dto.createdAt = data.created_at;

    return dto;
  }

  update(dto: UpdateCommentDto) {
    this.content = dto.content;
  }

  makeDeleted() {
    if (this.deletionStatus !== Boolean(DeletionStatus.NotDeleted)) {
      throw new Error('Entity already deleted');
    }

    this.deletionStatus = Boolean(DeletionStatus.PermanentDeleted);
  }
}
