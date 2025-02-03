import { UpdateSessionDto } from '../dto/update-session.dto';
import { CreateSessionInstanceSqlDto } from '../dto/sql-dto/create-session-instance.sql-dto';

export class Session {
  id: string;
  userId: string;
  tokenIat: number;
  tokenExp: number;
  ip: string;
  title: string;
  deviceId: string;
  lastActiveDate: Date;

  static createInstance(data: CreateSessionInstanceSqlDto): Session {
    const dto = new Session();

    dto.id = String(data.id);
    dto.userId = data.user_id;
    dto.tokenIat = data.token_iat;
    dto.tokenExp = data.token_exp;
    dto.ip = data.ip;
    dto.title = data.title;
    dto.deviceId = data.device_id;
    dto.lastActiveDate = data.last_active_date;

    return dto;
  }

  update(dto: UpdateSessionDto) {
    this.tokenIat = dto.tokenIat;
    this.tokenExp = dto.tokenExp;
    this.lastActiveDate = new Date(dto.tokenIat * 1000);
  }
}
