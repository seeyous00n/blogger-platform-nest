export class CreatePostInstanceSqlDto {
  id: string;
  title: string;
  short_description: string;
  content: string;
  blog_id: string;
  blog_name: string;
  deletion_status: boolean;
  created_at: Date;
}
