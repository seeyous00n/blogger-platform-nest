import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateUserSqlDto } from '../dto/sql-dto/create-user.sql-dto';
import { User } from '../domain/user.sql-entity';

@Injectable()
export class UsersSqlRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async findById(id: string) {
    try {
      const sqlQuery = `SELECT u.*,
                                     ei.email_confirmation_code,
                                     ei.email_is_confirmed,
                                     ei.email_code_expiration_date,
                                     pi.password_recovery_code,
                                     pi.password_expiration_date
                              FROM "user" u
                                       LEFT JOIN email_info ei ON u.id = ei.user_id
                                       LEFT JOIN password_info pi ON u.id = pi.user_id
                              WHERE u.id = $1
                                AND deletion_status = false`;
      const result = await this.datasource.query(sqlQuery, [id]);

      if (!result.length) return null;

      return User.createInstance(result[0]);
    } catch {
      return null;
    }
  }

  async create(data: CreateUserSqlDto) {
    const sqlQuery = `INSERT INTO "user" (login, email, password_hash)
                          VALUES ($1, $2, $3) RETURNING id`;
    const result = await this.datasource.query(sqlQuery, [
      data.login,
      data.email,
      data.password_hash,
    ]);

    const sqlQueryEmailInfo = `INSERT INTO "email_info" (user_id)
                                   VALUES ($1)`;
    const sqlQueryPasswordInfo = `INSERT INTO "password_info" (user_id)
                                      VALUES ($1)`;
    await this.datasource.query(sqlQueryEmailInfo, [result[0].id]);
    await this.datasource.query(sqlQueryPasswordInfo, [result[0].id]);

    return result[0];
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const sqlQuery = `SELECT u.*,
                                 ei.email_confirmation_code,
                                 ei.email_is_confirmed,
                                 ei.email_code_expiration_date,
                                 pi.password_recovery_code,
                                 pi.password_expiration_date
                          FROM "user" u
                                   LEFT JOIN email_info ei ON u.id = ei.user_id
                                   LEFT JOIN password_info pi ON u.id = pi.user_id
                          WHERE (email = $1 OR login = $1)
                            AND deletion_status = false`;
    const result = await this.datasource.query(sqlQuery, [loginOrEmail]);

    if (!result.length) return null;

    return User.createInstance(result[0]);
  }

  async findUserByEmailOrLogin(
    data: Omit<CreateUserDto, 'password'>,
  ): Promise<User | null> {
    const sqlQuery = `SELECT u.*,
                                 ei.email_confirmation_code,
                                 ei.email_is_confirmed,
                                 ei.email_code_expiration_date,
                                 pi.password_recovery_code,
                                 pi.password_expiration_date
                          FROM "user" u
                                   LEFT JOIN email_info ei ON u.id = ei.user_id
                                   LEFT JOIN password_info pi ON u.id = pi.user_id
                          WHERE (email = $1 OR login = $2)
                            AND deletion_status = false`;
    const result = await this.datasource.query(sqlQuery, [
      data.email,
      data.login,
    ]);

    if (!result.length) return null;

    return User.createInstance(result[0]);
  }

  async findByConfirmationCode(code: string) {
    const sqlQuery = `SELECT u.*,
                                 ei.email_confirmation_code,
                                 ei.email_is_confirmed,
                                 ei.email_code_expiration_date,
                                 pi.password_recovery_code,
                                 pi.password_expiration_date
                          FROM "email_info" ei
                                   LEFT JOIN "user" u ON ei.user_id = u.id
                                   LEFT JOIN password_info pi ON pi.user_id = u.id
                          WHERE email_confirmation_code = $1`;
    const result = await this.datasource.query(sqlQuery, [code]);

    if (!result.length) return null;

    return User.createInstance(result[0]);
  }

  async findByEmail(email: string) {
    const sqlQuery = `SELECT u.*,
                                 ei.email_confirmation_code,
                                 ei.email_is_confirmed,
                                 ei.email_code_expiration_date,
                                 pi.password_recovery_code,
                                 pi.password_expiration_date
                          FROM "user" u
                                   LEFT JOIN email_info ei ON u.id = ei.user_id
                                   LEFT JOIN password_info pi ON u.id = pi.user_id
                          WHERE email = $1`;
    const result = await this.datasource.query(sqlQuery, [email]);

    if (!result.length) return null;

    return User.createInstance(result[0]);
  }

  async findByRecoveryCode(recoveryCode: string) {
    const sqlQuery = `SELECT u.*,
                                 ei.email_confirmation_code,
                                 ei.email_is_confirmed,
                                 ei.email_code_expiration_date,
                                 pi.password_recovery_code,
                                 pi.password_expiration_date
                          FROM password_info pi
                                   LEFT JOIN "user" u ON pi.user_id = u.id
                                   LEFT JOIN email_info ei ON ei.user_id = u.id
                          WHERE password_recovery_code = $1`;
    const result = await this.datasource.query(sqlQuery, [recoveryCode]);

    if (!result.length) return null;

    return User.createInstance(result[0]);
  }

  async save(user: User) {
    const sqlQueryUser = `UPDATE "user"
                              SET login           = $2,
                                  email           = $3,
                                  password_hash   = $4,
                                  deletion_status = $5
                              WHERE id = $1`;

    const sqlQueryEmailInfo = `UPDATE email_info
                                   SET email_confirmation_code    = $2,
                                       email_is_confirmed         = $3,
                                       email_code_expiration_date = $4
                                   WHERE user_id = $1`;

    const sqlQueryPasswordInfo = `UPDATE password_info
                                      SET password_recovery_code   = $2,
                                          password_expiration_date = $3
                                      WHERE user_id = $1`;

    await this.datasource.query(sqlQueryUser, [
      user.id,
      user.login,
      user.email,
      user.passwordHash,
      user.deletionStatus,
    ]);

    await this.datasource.query(sqlQueryEmailInfo, [
      user.id,
      user.emailConfirmationCode,
      user.emailIsConfirmed,
      user.emailCodeExpirationDate,
    ]);

    await this.datasource.query(sqlQueryPasswordInfo, [
      user.id,
      user.passwordRecoveryCode,
      user.passwordExpirationDate,
    ]);
  }
}
