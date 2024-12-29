import { IsString, Length } from 'class-validator';

export class UpdatePostInput {
  @IsString()
  @Length(20, 300)
  content: string;
}
