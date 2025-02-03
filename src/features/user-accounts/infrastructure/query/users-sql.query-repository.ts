import { Injectable } from '@nestjs/common';
import {
  UserSqlViewAuthDto,
  UserSqlViewDto,
} from '../../api/view-dto/user.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { transformToSnakeCase } from '../../../../core/utils/transform-to-snake-case.utils';

@Injectable()
export class UsersSqlQueryRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async getAll(query: GetUsersQueryParams) {
    const sortBy = transformToSnakeCase(query.sortBy);

    const params = [
      `%${query.searchLoginTerm}%`,
      `%${query.searchEmailTerm}%`,
      query.pageSize,
      query.calculateSkip(),
    ];

    const sqlQuery = `
            SELECT id, login, email, created_at
            FROM "user"
            WHERE (login ILIKE $1 OR email ILIKE $2)
              AND deletion_status = false
            ORDER BY ${sortBy} ${query.sortDirection} 
             LIMIT $3
            OFFSET $4
        `;

    const users = await this.datasource.query(sqlQuery, params);

    const totalCount = await this.datasource.query(
      `SELECT COUNT(*) as count
       FROM "user"
       WHERE (login ILIKE $1
          OR email ILIKE $2)
         AND deletion_status = false`,
      [params[0], params[1]],
    );

    const items = users.map(UserSqlViewDto.mapToView);

    return PaginationViewDto.mapToView({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount[0].count,
      items,
    });
  }

  async getById(id: string) {
    const sqlQuery = `SELECT id, login, email, created_at
                          FROM "user"
                          WHERE id = $1
                            AND deletion_status = false`;
    const user = await this.datasource.query(sqlQuery, [id]);
    if (!user.length) {
      return null;
    }

    return UserSqlViewDto.mapToView(user[0]);
  }

  async getAuthUser(id: string) {
    const sqlQuery = `SELECT login, email, id
                          FROM "user"
                          WHERE id = $1
                            AND deletion_status = false`;
    const user = await this.datasource.query(sqlQuery, [id]);
    if (!user.length) {
      return null;
    }

    return UserSqlViewAuthDto.mapToView(user[0]);
  }
}
