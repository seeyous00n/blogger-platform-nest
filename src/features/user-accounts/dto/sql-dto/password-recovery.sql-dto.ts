export class PasswordRecoveryDto {
  id: string;
  expirationDate: Date;
  recoveryCode: string;
}
