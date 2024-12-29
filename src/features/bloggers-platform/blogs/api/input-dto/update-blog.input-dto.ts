import { IsString, MaxLength } from 'class-validator';

export class UpdateBlogInputDto {
  @IsString()
  @MaxLength(15)
  name: string;

  @IsString()
  @MaxLength(500)
  description: string;

  @IsString()
  @MaxLength(100)
  websiteUrl: string;
}
