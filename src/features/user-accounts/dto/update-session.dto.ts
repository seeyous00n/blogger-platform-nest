export class UpdateSessionDto {
  userId: string;
  tokenIat: number;
  tokenExp: number;
  ip: string;
  title: string;
  deviceId: string;
}
