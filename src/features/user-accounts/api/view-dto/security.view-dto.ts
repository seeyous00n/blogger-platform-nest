import { SessionDocument } from '../../domain/session.entity';

export class SecurityViewDto {
  ip: string;
  title: string;
  lastActiveDate: Date;
  deviceId: string;

  static mapToView(session: SessionDocument): SecurityViewDto {
    const dto = new SecurityViewDto();
    dto.ip = session.ip;
    dto.title = session.title;
    dto.lastActiveDate = session.lastActiveDate;
    dto.deviceId = session.deviceId;

    return dto;
  }
}
