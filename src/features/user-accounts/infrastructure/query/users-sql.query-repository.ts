import { Injectable } from '@nestjs/common';
import {
  UserSqlViewAuthDto,
  UserSqlViewDto,
} from '../../api/view-dto/user.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersSqlQueryRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async getAll(query: GetUsersQueryParams) {
    const sortBy =
      query.sortBy && String(query.sortBy) === 'createdAt'
        ? 'created_at'
        : query.sortBy;

    const sqlQuery = `
            SELECT id, login, email, created_at
            FROM "user"
            WHERE (login ILIKE $1 OR email ILIKE $2)
              AND deletion_status = false
            ORDER BY ${sortBy} ${query.sortDirection} 
             LIMIT $3
            OFFSET $4
        `;

    const users = await this.datasource.query(sqlQuery, [
      `%${query.searchLoginTerm}%`,
      `%${query.searchEmailTerm}%`,
      query.pageSize,
      query.calculateSkip(),
    ]);

    const totalCount = await this.datasource.query(
      `SELECT id, login, email, created_at
             FROM "user"
             WHERE (login ILIKE $1 OR email ILIKE $2)
               AND deletion_status = false`,
      [`%${query.searchLoginTerm}%`, `%${query.searchEmailTerm}%`],
    );

    const items = users.map(UserSqlViewDto.mapToView);

    return PaginationViewDto.mapToView({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount.length,
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
