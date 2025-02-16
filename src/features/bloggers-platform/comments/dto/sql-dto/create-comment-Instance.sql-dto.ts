export class CreateCommentInstanceSqlDto {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  deletion_status: boolean;
  created_at: Date;
}
