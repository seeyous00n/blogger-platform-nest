import { CreateUserInstanceSqlDto } from '../dto/sql-dto/create-user-instance.sql-dto';

export enum DeletionStatus {
  NotDeleted = 0,
  PermanentDeleted = 1,
}

export class User {
  id: string;
  login: string;
  email: string;
  passwordHash: string;

  passwordRecoveryCode: string = null;
  passwordExpirationDate: Date = null;
  emailConfirmationCode: string = null;
  emailIsConfirmed: boolean = false;
  emailCodeExpirationDate: Date = null;
  deletionStatus: boolean = false;
  createdAt: Date;

  static createInstance(data: CreateUserInstanceSqlDto): User {
    const dto = new User();

    dto.id = String(data.id);
    dto.login = data.login;
    dto.email = data.email;
    dto.passwordHash = data.password_hash;

    dto.passwordRecoveryCode = data.password_recovery_code;
    dto.passwordExpirationDate = data.password_expiration_date;
    dto.emailConfirmationCode = data.email_confirmation_code;
    dto.emailIsConfirmed = data.email_is_confirmed;
    dto.emailCodeExpirationDate = data.email_code_expiration_date;
    dto.deletionStatus = Boolean(data.deletion_status);
    dto.createdAt = data.created_at;

    return dto;
  }

  makeDeleted() {
    if (this.deletionStatus !== Boolean(DeletionStatus.NotDeleted)) {
      throw new Error('Entity already deleted');
    }

    this.deletionStatus = Boolean(DeletionStatus.PermanentDeleted);
  }
}
