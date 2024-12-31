import { IsEmail, IsString, Length, Matches } from 'class-validator';
import {
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';

export class CreateUserInputDto {
  @IsString()
  @Length(loginConstraints.minLength, loginConstraints.maxLength)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login: string;

  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  password: string;

  @IsEmail()
  email: string;
}
