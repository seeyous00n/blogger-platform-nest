export class CreateUserInstanceSqlDto {
  id: string;
  login: string;
  email: string;
  password_hash: string;

  password_recovery_code: string = null;
  password_expiration_date: Date = null;
  email_confirmation_code: string = null;
  email_is_confirmed: boolean = false;
  email_code_expiration_date: Date = null;
  deletion_status: boolean = false;
  created_at: Date;
}
