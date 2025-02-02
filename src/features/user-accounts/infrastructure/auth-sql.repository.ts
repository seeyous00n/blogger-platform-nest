import { Injectable } from '@nestjs/common';
import { DeleteSessionDto } from '../dto/delete-session.dto';
import { DeleteSessionsDto } from '../dto/delete-sessions.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateSessionSqlDto } from '../dto/sql-dto/create-session.sql-dto';
import { Session } from '../domain/session.sql-entity';

@Injectable()
export class AuthSqlRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async findSessionByIatAndDeviceId(iat: number, deviceId: string) {
    const sqlQuery = `SELECT *
                          FROM session
                          WHERE token_iat = $1
                            AND device_id = $2`;
    const result = await this.datasource.query(sqlQuery, [iat, deviceId]);
    if (!result.length) {
      return null;
    }

    return Session.createInstance(result[0]);
  }

  async create(data: CreateSessionSqlDto) {
    const sqlQuery = `INSERT INTO "session" (user_id, token_iat, token_exp, ip, title, device_id)
                          VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    const result = await this.datasource.query(sqlQuery, [
      data.userId,
      data.tokenIat,
      data.tokenExp,
      data.ip,
      data.title,
      data.deviceId,
    ]);

    return result[0];
  }

  async save(session: Session): Promise<void> {
    const sqlQuery = `UPDATE "session"
                          SET user_id          = $2,
                              token_iat        = $3,
                              token_exp        = $4,
                              ip               = $5,
                              title            = $6,
                              device_id        = $7,
                              last_active_date = $8
                          WHERE id = $1`;

    await this.datasource.query(sqlQuery, [
      session.id,
      session.userId,
      session.tokenIat,
      session.tokenExp,
      session.ip,
      session.title,
      session.deviceId,
      session.lastActiveDate,
    ]);
  }

  async delete(id: string): Promise<void> {
    const sqlQuery = `DELETE
                          FROM session
                          WHERE id = $1`;
    await this.datasource.query(sqlQuery, [id]);
  }

  async findByDeviceId(deviceId: string) {
    const sqlQuery = `SELECT *
                          FROM session
                          WHERE device_id = $1`;

    const result = await this.datasource.query(sqlQuery, [deviceId]);
    if (!result.length) {
      return null;
    }

    return Session.createInstance(result[0]);
  }

  async findByDeviceIdAndUserId(data: DeleteSessionDto) {
    const sqlQuery = `SELECT *
                          FROM session
                          WHERE device_id = $1
                            AND user_id = $2`;

    const result = await this.datasource.query(sqlQuery, [
      data.deviceId,
      data.userId,
    ]);
    if (!result.length) {
      return null;
    }

    return Session.createInstance(result[0]);
  }

  async deleteAllExceptCurrent(data: DeleteSessionsDto) {
    const sqlQuery = `DELETE
                          FROM session
                          WHERE user_id = $1
                            AND device_id <> $2 `;
    await this.datasource.query(sqlQuery, [data.userId, data.deviceId]);
  }
}
