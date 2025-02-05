import { Injectable } from '@nestjs/common';
import { CommentSqlViewDto } from '../../api/view-dto/comment-view.dto';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { transformToSnakeCase } from '../../../../../core/utils/transform-to-snake-case.utils';

@Injectable()
export class CommentsSqlQueryRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async getAll(
    query: GetCommentsQueryParams,
    authorId: string | null,
    id?: string,
  ) {
    const sortBy = transformToSnakeCase(query.sortBy);

    const condition = [];
    const params: (string | number)[] = [query.pageSize, query.calculateSkip()];

    if (authorId) {
      condition.push(
        ` (SELECT status FROM "like" WHERE author_id = $${params.length + 1} AND parent_id = c.id)`,
      );
      params.push(authorId);
    }

    if (id) {
      condition.push(` AND post_id = $${params.length + 1}`);
      params.push(id);
    }

    const sqlQuery = `
            SELECT c.id,
                   c.content,
                   user_id,
                   u.login                                                                     AS user_login,
                   c.created_at,
                   ${authorId ? condition[0] : "'None' "}                                      AS my_status,
                   (SELECT COUNT(*) FROM "like" WHERE parent_id = c.id AND status = 'Like')    AS likes_count,
                   (SELECT COUNT(*) FROM "like" WHERE parent_id = c.id AND status = 'Dislike') AS dislikes_count
            FROM comment c
                     LEFT JOIN "user" u ON c.user_id = u.id
            WHERE c.deletion_status = false ${authorId && id ? condition[1] : id ? condition[0] : ''}
            ORDER BY ${sortBy} ${query.sortDirection}
                LIMIT $1
            OFFSET $2
        `;
    const comments = await this.datasource.query(sqlQuery, params);

    const countParams = id ? [id] : [];
    const totalCount = await this.datasource.query(
      `SELECT COUNT(*) as total_count
             FROM "comment"
             WHERE deletion_status = false ${id ? `AND post_id = $1` : ``}`,
      countParams,
    );

    const commentsWithLikes = comments.map(CommentSqlViewDto.mapToView);

    return PaginationViewDto.mapToView({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(totalCount[0].total_count),
      items: commentsWithLikes,
    });
  }

  async getById(id: string, authorId?: string) {
    const params = [id];
    if (authorId) {
      params.push(authorId);
    }

    const sqlQuery = `
            SELECT c.id,
                   c.content,
                   user_id,
                   u.login                                                                                           AS user_login,
                   c.created_at,
                   ${authorId ? `(SELECT status FROM "like" WHERE author_id = $2 AND parent_id = c.id) ` : `'None'`} AS my_status,
                   (SELECT COUNT(*) FROM "like" WHERE parent_id = c.id AND status = 'Like')                          AS likes_count,
                   (SELECT COUNT(*)
                    FROM "like"
                    WHERE parent_id = c.id AND status = 'Dislike')                                                   AS dislikes_count
            FROM comment c
                     LEFT JOIN "user" u ON c.user_id = u.id
                     LEFT JOIN "like" l ON c.id = l.parent_id
            WHERE c.id = $1
              AND c.deletion_status = false`;

    const comment = await this.datasource.query(sqlQuery, params);
    if (!comment.length) {
      return null;
    }

    return CommentSqlViewDto.mapToView(comment[0]);
  }
}
