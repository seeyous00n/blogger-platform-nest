import { UpdateLikeStatusDto } from '../dto/update-like-status.dto';
import { CreateLikeInstanceSqlDto } from '../dto/sql-dto/create-like-instance.sql-dto';

export enum MyStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export class Like {
  id: string;
  status: MyStatus;
  authorId: string;
  parentId: string;
  isNewLike: number;
  createdAt: Date;

  static createInstance(data: CreateLikeInstanceSqlDto): Like {
    const dto = new Like();
    dto.id = String(data.id);
    dto.status = data.status;
    dto.authorId = data.author_id;
    dto.parentId = data.parent_id;
    dto.isNewLike = data.is_new_like;
    dto.createdAt = data.created_at;

    return dto;
  }

  update(dto: UpdateLikeStatusDto) {
    this.status = dto.likeStatus;
  }
}
