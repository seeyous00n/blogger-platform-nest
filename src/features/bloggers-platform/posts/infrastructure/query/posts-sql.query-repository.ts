import { Injectable } from '@nestjs/common';
import { PostSqlViewDto } from '../../api/view-dto/post.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { transformToSnakeCase } from '../../../../../core/utils/transform-to-snake-case.utils';

@Injectable()
export class PostsSqlQueryRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async getAll(
    query: GetPostsQueryParams,
    authorId: string | null,
    id?: string,
  ): Promise<PaginationViewDto<PostSqlViewDto[]>> {
    const sortBy = transformToSnakeCase(query.sortBy);

    const condition = [];
    const params: (string | number)[] = [query.pageSize, query.calculateSkip()];

    if (authorId) {
      condition.push(
        ` (SELECT status FROM "like" WHERE author_id = $${params.length + 1} AND parent_id = p.id)`,
      );
      params.push(authorId);
    }

    if (id) {
      condition.push(` AND blog_id = $${params.length + 1}`);
      params.push(id);
    }

    const sqlQuery = `
        SELECT p.id,
               title,
               short_description,
               content,
               blog_id,
               name                                                                        AS blog_name,
               p.created_at,
               ${authorId ? condition[0] : "'None' "}                                      AS my_status,
               (SELECT COUNT(*) FROM "like" WHERE parent_id = p.id AND status = 'Like')    AS likes_count,
               (SELECT COUNT(*) FROM "like" WHERE parent_id = p.id AND status = 'Dislike') AS dislikes_count,
               (SELECT JSON_AGG(sub_likes)
                FROM (SELECT u.id::VARCHAR AS "userId", u.login, l.created_at AS "addedAt"
                      FROM "like" l
                               LEFT JOIN "user" u ON l.author_id = u.id
                      WHERE parent_id = p.id
                        AND is_new_like = 1
                        AND status = 'Like'
                      ORDER BY l.created_at DESC LIMIT 3) AS sub_likes)                    AS newest_likes
        FROM "post" p
                 LEFT JOIN "blog" b ON p.blog_id = b.id
        WHERE p.deletion_status = false ${authorId && id ? condition[1] : id ? condition[0] : ''}
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
    const condition = authorId
      ? ` (SELECT status FROM "like" WHERE author_id = $2 AND parent_id = p.id)`
      : `'None'`;
    const params = [id];
    if (authorId) {
      params.push(authorId);
    }
    const sqlQuery = `
        SELECT p.id,
               title,
               short_description,
               content,
               blog_id,
               b.name                                                   AS blog_name,
               p.created_at,
               ${condition}                                             AS my_status,
               (SELECT COUNT(*)
                FROM "like"
                WHERE parent_id = p.id
                  AND status = 'Like')                                  AS likes_count,
               (SELECT COUNT(*)
                FROM "like"
                WHERE parent_id = p.id
                  AND status = 'Dislike')                               AS dislikes_count,
               (SELECT JSON_AGG(sub_likes)
                FROM (SELECT u.id::VARCHAR AS "userId", u.login, l.created_at AS "addedAt"
                      FROM "like" l
                               LEFT JOIN "user" u ON l.author_id = u.id
                      WHERE parent_id = p.id
                        AND is_new_like = 1
                        AND status = 'Like'
                      ORDER BY l.created_at DESC LIMIT 3) AS sub_likes) AS newest_likes
        FROM "post" p
                 LEFT JOIN "blog" b
                           ON p.blog_id = b.id
        WHERE p.id = $1
          AND p.deletion_status = false`;

    const post = await this.datasource.query(sqlQuery, params);
    if (!post.length) {
      return null;
    }

    return PostSqlViewDto.mapToView(post[0]);
  }
}
