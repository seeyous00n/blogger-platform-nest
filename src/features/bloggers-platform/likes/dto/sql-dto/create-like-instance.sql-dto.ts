import { MyStatus } from '../../domain/like.sql-entity';

export class CreateLikeInstanceSqlDto {
  id: string;
  status: MyStatus;
  author_id: string;
  parent_id: string;
  is_new_like: number;
  created_at: Date;
}
