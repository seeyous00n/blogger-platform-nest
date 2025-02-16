import { MyStatus } from '../../../likes/domain/like.sql-entity';

export class CommentSearchResultSqlDto {
  id: number;
  content: string;
  created_at: Date;
  user_id: number;
  user_login: string;
  likes_count: string;
  dislikes_count: string;
  my_status: MyStatus;
}
