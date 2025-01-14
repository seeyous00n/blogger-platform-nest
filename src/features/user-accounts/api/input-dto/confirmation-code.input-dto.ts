import { IsString } from 'class-validator';

export class ConfirmationCodeInputDto {
  @IsString()
  code: string;
}
