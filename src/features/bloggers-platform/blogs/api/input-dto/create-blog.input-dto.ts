import { IsUrl, MaxLength } from 'class-validator';
import {
  blogDescriptionConstraints,
  blogNameConstraints,
  blogWebsiteUrlConstraints,
} from '../../domain/blog.entity';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';

export class CreateBlogInputDto {
  @IsStringWithTrim(1, blogNameConstraints.maxLength)
  name: string;

  @IsStringWithTrim(1, blogDescriptionConstraints.maxLength)
  description: string;

  @IsUrl()
  @MaxLength(blogWebsiteUrlConstraints.maxLength)
  websiteUrl: string;
}
