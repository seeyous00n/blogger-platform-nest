import { Injectable } from '@nestjs/common';
import { BlogSqlViewDto } from '../../api/view-dto/blog.view-dto';
import { GetBlogQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { transformToSnakeCase } from '../../../../../core/utils/transform-to-snake-case.utils';

@Injectable()
export class BlogsSqlQueryRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async getAll(
    query: GetBlogQueryParams,
  ): Promise<PaginationViewDto<BlogSqlViewDto[]>> {
    const sortBy = transformToSnakeCase(query.sortBy);
    const params = [
      `%${query.searchNameTerm}%`,
      query.pageSize,
      query.calculateSkip(),
    ];

    const sqlQuery = `
            SELECT id, name, description, website_url, created_at, is_membership
            FROM "blog"
            WHERE name ILIKE $1
              AND deletion_status = false
            ORDER BY ${sortBy} ${query.sortDirection}
                LIMIT $2
            OFFSET $3
        `;

    const blogs = await this.datasource.query(sqlQuery, params);

    const totalCount = await this.datasource.query(
      `SELECT COUNT(*) as total_count
             FROM "blog"
             WHERE name ILIKE $1
               AND deletion_status = false`,
      [params[0]],
    );

    const items = blogs.map(BlogSqlViewDto.mapToView);

    return PaginationViewDto.mapToView({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(totalCount[0].total_count),
      items,
    });
  }

  async getById(id: string): Promise<BlogSqlViewDto | null> {
    const sqlQuery = `SELECT id, name, description, website_url, created_at, is_membership
                          FROM "blog"
                          WHERE id = $1
                            AND deletion_status = false`;
    const blog = await this.datasource.query(sqlQuery, [id]);
    if (!blog.length) {
      return null;
    }

    return BlogSqlViewDto.mapToView(blog[0]);
  }
}
