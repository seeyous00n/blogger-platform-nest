import { IsUrl, MaxLength } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import {
  blogDescriptionConstraints,
  blogNameConstraints,
  blogWebsiteUrlConstraints,
} from '../../domain/blog.sql-entity';

export class UpdateBlogInputDto {
  @IsStringWithTrim(1, blogNameConstraints.maxLength)
  name: string;

  @IsStringWithTrim(1, blogDescriptionConstraints.maxLength)
  description: string;

  @IsUrl()
  @MaxLength(blogWebsiteUrlConstraints.maxLength)
  websiteUrl: string;
}
