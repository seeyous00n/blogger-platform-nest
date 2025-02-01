export class User {
  id: number;
  login: string;
  email: string;
  password_hash: string;

  password_recovery_code: string;
  password_expiration_date: Date;
  email_confirmation_code: string;
  email_is_confirmed: boolean;
  email_code_expiration_date: Date;
  deletion_status: boolean;
  created_at: Date;

  static mapToSql(data: any): User {
    const dto = new User();

    dto.id = data.id;
    dto.login = data.login;
    dto.email = data.email;
    dto.password_hash = data.hash;

    dto.password_recovery_code = data.password_recovery_code;
    dto.password_expiration_date = data.password_expiration_date;
    dto.email_confirmation_code = data.email_confirmation_code;
    dto.email_is_confirmed = data.email_is_confirmed;
    dto.email_code_expiration_date = data.email_code_expiration_date;
    dto.deletion_status = data.deletion_status;
    dto.created_at = data.created_at;

    return dto;
  }
}
