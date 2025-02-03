import { Injectable } from '@nestjs/common';
import { PostSqlViewDto } from '../../api/view-dto/post.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { LikeHelper } from '../../../likes/like.helper';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { transformToSnakeCase } from '../../../../../core/utils/transform-to-snake-case.utils';

@Injectable()
export class PostsSqlQueryRepository {
  constructor(
    @InjectDataSource() private datasource: DataSource,
    private likeHelper: LikeHelper,
  ) {}

  async getAll(
    query: GetPostsQueryParams,
    authorId: string | null,
    id?: string,
  ): Promise<PaginationViewDto<PostSqlViewDto[]>> {
    const sortBy = transformToSnakeCase(query.sortBy);

    const condition = id ? `AND blog_id = $3` : ``;
    const params: (string | number)[] = [query.pageSize, query.calculateSkip()];
    if (id) {
      params.push(id);
    }

    const sqlQuery = `
            SELECT id, title, short_description, content, blog_id, blog_name, created_at
            FROM "post"
            WHERE deletion_status = false ${condition}
            ORDER BY ${sortBy} ${query.sortDirection}
                LIMIT $1
            OFFSET $2
        `;
    const posts = await this.datasource.query(sqlQuery, params);

    const countParams = id ? [id] : [];
    const totalCount = await this.datasource.query(
      `SELECT COUNT(*) as total_count
             FROM "post"
             WHERE deletion_status = false ${id ? `AND blog_id = $1` : ``}`,
      countParams,
    );

    const postsWithLikes = posts.map(PostSqlViewDto.mapToView);

    return PaginationViewDto.mapToView({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(totalCount[0].total_count),
      items: postsWithLikes,
    });
  }

  async getById(id: string, authorId?: string): Promise<PostSqlViewDto | null> {
    const sqlQuery = `SELECT id, title, short_description, content, blog_id, blog_name, created_at
                          FROM "post"
                          WHERE id = $1
                            AND deletion_status = false`;
    const post = await this.datasource.query(sqlQuery, [id]);
    if (!post.length) {
      return null;
    }

    return PostSqlViewDto.mapToView(post[0]);
  }
}
