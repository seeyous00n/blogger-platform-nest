import { IsString, Length } from 'class-validator';
import { passwordConstraints } from '../../domain/user.entity';

export class NewPasswordInputDto {
  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  newPassword: string;

  @IsString()
  recoveryCode: string;
}
