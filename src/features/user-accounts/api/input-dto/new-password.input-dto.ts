import { IsString, Length } from 'class-validator';
import { passwordConstraints } from '../../domain/user.sql-entity';

export class NewPasswordInputDto {
  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  newPassword: string;

  @IsString()
  recoveryCode: string;
}
