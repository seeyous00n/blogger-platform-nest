import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exception';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateUserSqlDto } from '../dto/sql-dto/create-user.sql-dto';
import { EmailInfoSqlDto } from '../dto/sql-dto/email-info.sql-dto';
import { PasswordRecoveryDto } from '../dto/sql-dto/password-recovery.sql-dto';

@Injectable()
export class UsersSqlRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async findById(id: string) {
    try {
      const sql = `SELECT *
                     FROM "user"
                     WHERE id = $1
                       AND deletion_status = false`;
      const result = await this.datasource.query(sql, [id]);

      return result;
    } catch (error) {
      throw NotFoundDomainException.create();
    }
  }

  async create(data: CreateUserSqlDto) {
    const sql = `INSERT INTO "user" (login, email, password_hash)
                     VALUES ($1, $2, $3) RETURNING id`;
    const result = await this.datasource.query(sql, [
      data.login,
      data.email,
      data.password_hash,
    ]);

    return result;
  }

  async findOneOrNotFoundError(id: string) {
    const user = await this.findById(id);
    if (!user) throw NotFoundDomainException.create();

    return user;
  }

  async updateIsConfirmedCode(id: string) {
    const sql = `UPDATE "user"
                     SET email_is_confirmed = true
                     WHERE id = $1 RETURNING id`;
    const result = await this.datasource.query(sql, [id]);

    return result;
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const sql = `SELECT id, password_hash
                     FROM "user"
                     WHERE (email = $1 OR login = $1)
                       AND deletion_status = false`;
    const result = await this.datasource.query(sql, [loginOrEmail]);

    return result;
    // return this.UserModel.findOne({
    //   $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    // });
  }

  async findUserByEmailOrLogin(data: Omit<CreateUserDto, 'password'>) {
    // return this.UserModel.findOne({
    //   $or: [{ email: data.email }, { login: data.login }],
    // });

    const sql = `SELECT *
                     FROM "user"
                     WHERE (email = $1 OR login = $2)
                       AND deletion_status = false`;
    const result = await this.datasource.query(sql, [data.email, data.login]);

    return result;
  }

  async makeDeleted(id: string) {
    const sql = `UPDATE "user"
                     SET deletion_status = true
                     WHERE id = $1 RETURNING id`;
    const result = await this.datasource.query(sql, [id]);

    return result;
  }

  async updateEmailConfirmationInfo(data: EmailInfoSqlDto) {
    const sql = `UPDATE "user"
                     SET email_confirmation_code    = $1,
                         email_code_expiration_date = $2
                     WHERE id = $3 RETURNING id`;
    await this.datasource.query(sql, [
      data.confirmationCode,
      data.expirationDate,
      data.id,
    ]);
  }

  async findByConfirmationCode(code: string) {
    const sql = `SELECT id, email_is_confirmed, email_code_expiration_date
                     FROM "user"
                     WHERE email_confirmation_code = $1`;
    const result = await this.datasource.query(sql, [code]);
    return result;
    // return this.UserModel.findOne({
    //   'emailConfirmation.confirmationCode': code,
    // });
  }

  async setIsConfirmed(id: string) {
    const sql = `UPDATE "user"
                     SET email_is_confirmed = true
                     WHERE id = $1`;
    await this.datasource.query(sql, [id]);
  }

  async findByEmail(email: string) {
    const sql = `SELECT id, email, email_is_confirmed
                     FROM "user"
                     WHERE email = $1`;
    const result = await this.datasource.query(sql, [email]);
    return result;
    // return this.UserModel.findOne({ email: email });
  }

  async updatePasswordConfirmationInfo(data: PasswordRecoveryDto) {
    const sql = `UPDATE "user"
                     SET password_recovery_code   = $1,
                         password_expiration_date = $2
                     WHERE id = $3`;
    await this.datasource.query(sql, [
      data.recoveryCode,
      data.expirationDate,
      data.id,
    ]);
  }

  async findByRecoveryCode(recoveryCode: string) {
    const sql = `SELECT id, password_expiration_date
                     FROM "user"
                     WHERE password_recovery_code = $1`;
    const result = await this.datasource.query(sql, [recoveryCode]);
    return result;
  }

  async updatePasswordHash(id: string, hash: string) {
    const sql = `UPDATE "user"
                     SET password_hash = $1
                     WHERE id = $2`;
    await this.datasource.query(sql, [hash, id]);
  }
}
