export class CreateSessionInstanceSqlDto {
  id: string;
  user_id: string;
  token_iat: number;
  token_exp: number;
  ip: string;
  title: string;
  device_id: string;
  last_active_date: Date;
}
