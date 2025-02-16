import { IsNotEmpty, IsString, Length } from 'class-validator';
import { passwordConstraints } from '../../domain/user.sql-entity';

export class LoginUserInputDto {
  @IsString()
  @IsNotEmpty()
  loginOrEmail: string;

  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  password: string;
}
