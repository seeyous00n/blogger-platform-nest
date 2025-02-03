import { BlogSearchResultSqlDto } from '../../dto/sql-dto/blog-search-result.sql-dto';

export class BlogSqlViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;

  static mapToView(blog: BlogSearchResultSqlDto): BlogSqlViewDto {
    const dto = new BlogSqlViewDto();
    dto.id = String(blog.id);
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.website_url;
    dto.createdAt = blog.created_at;
    dto.isMembership = blog.is_membership;

    return dto;
  }
}
