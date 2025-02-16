import { CreateSessionDto } from '../create-session.dto';

export class CreateSessionSqlDto {
  userId: string;
  tokenIat: number;
  tokenExp: number;
  ip: string;
  title: string;
  deviceId: string;

  static mapToSql(data: CreateSessionDto) {
    const dto = new CreateSessionSqlDto();
    dto.userId = data.userId;
    dto.tokenIat = data.tokenIat;
    dto.tokenExp = data.tokenExp;
    dto.ip = data.ip;
    dto.title = data.title;
    dto.deviceId = data.deviceId;

    return dto;
  }
}
