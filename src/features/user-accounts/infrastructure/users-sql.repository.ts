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
      const sqlQuery = `SELECT *
                              FROM "user"
                              WHERE id = $1
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

    return result[0];
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const sqlQuery = `SELECT id, password_hash
                          FROM "user"
                          WHERE (email = $1 OR login = $1)
                            AND deletion_status = false`;
    const result = await this.datasource.query(sqlQuery, [loginOrEmail]);

    if (!result.length) return null;

    return User.createInstance(result[0]);
  }

  async findUserByEmailOrLogin(
    data: Omit<CreateUserDto, 'password'>,
  ): Promise<User | null> {
    const sqlQuery = `SELECT *
                          FROM "user"
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
    const sqlQuery = `SELECT *
                          FROM "user"
                          WHERE email_confirmation_code = $1`;
    const result = await this.datasource.query(sqlQuery, [code]);

    if (!result.length) return null;

    return User.createInstance(result[0]);
  }

  async findByEmail(email: string) {
    const sqlQuery = `SELECT *
                          FROM "user"
                          WHERE email = $1`;
    const result = await this.datasource.query(sqlQuery, [email]);

    if (!result.length) return null;

    return User.createInstance(result[0]);
  }

  async findByRecoveryCode(recoveryCode: string) {
    const sqlQuery = `SELECT *
                          FROM "user"
                          WHERE password_recovery_code = $1`;
    const result = await this.datasource.query(sqlQuery, [recoveryCode]);

    if (!result.length) return null;

    return User.createInstance(result[0]);
  }

  async save(user: User) {
    const sqlQuery = `UPDATE "user"
                          SET login                      = $2,
                              email                      = $3,
                              password_hash              = $4,
                              password_recovery_code     = $5,
                              password_expiration_date   = $6,
                              email_confirmation_code    = $7,
                              email_is_confirmed         = $8,
                              email_code_expiration_date = $9,
                              deletion_status            = $10
                          WHERE id = $1`;
    await this.datasource.query(sqlQuery, [
      user.id,
      user.login,
      user.email,
      user.passwordHash,
      user.passwordRecoveryCode,
      user.passwordExpirationDate,
      user.emailConfirmationCode,
      user.emailIsConfirmed,
      user.emailCodeExpirationDate,
      user.deletionStatus,
    ]);
  }
}
