export class CreateSessionDto {
  userId: string;
  tokenIat: number;
  tokenExp: number;
  ip: string;
  title: string;
  deviceId: string;
}
