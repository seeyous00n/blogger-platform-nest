import { Injectable } from '@nestjs/common';
import { SecurityViewDto } from '../../api/view-dto/security.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SecuritySqlQueryRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async getAllDevices(userId: string) {
    const sqlQuery = `SELECT *
                          FROM session
                          WHERE user_id = $1`;
    const sessions = await this.datasource.query(sqlQuery, [userId]);

    return sessions.map((item) => SecurityViewDto.mapToView(item));
  }
}
