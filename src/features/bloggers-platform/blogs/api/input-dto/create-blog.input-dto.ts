import { IsString, IsUrl, MaxLength } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class CreateBlogInputDto {
  @Trim()
  @IsString()
  //TODO move all numbers to constants
  @MaxLength(15)
  name: string;

  @IsString()
  @MaxLength(500)
  description: string;

  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
