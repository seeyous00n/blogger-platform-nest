export class SecurityViewDto {
  ip: string;
  title: string;
  lastActiveDate: Date;
  deviceId: string;

  static mapToView(session: any): SecurityViewDto {
    const dto = new SecurityViewDto();
    dto.ip = session.ip;
    dto.title = session.title;
    dto.lastActiveDate = session.last_active_date;
    dto.deviceId = session.device_id;

    return dto;
  }
}
