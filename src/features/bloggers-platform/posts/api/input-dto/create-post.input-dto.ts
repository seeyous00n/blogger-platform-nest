import { IsString } from 'class-validator';
import {
  postContentConstraints,
  postShortDescriptionConstraints,
  postTitleConstraints,
} from '../../domain/post.entity';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';

export class CreatePostInputDTO {
  @IsStringWithTrim(1, postTitleConstraints.maxLength)
  title: string;

  @IsStringWithTrim(1, postShortDescriptionConstraints.maxLength)
  shortDescription: string;

  @IsStringWithTrim(1, postContentConstraints.maxLength)
  content: string;

  @IsString()
  blogId: string;
}

export class CreatePostByBlogInputDTO {
  @IsStringWithTrim(1, postTitleConstraints.maxLength)
  title: string;

  @IsStringWithTrim(1, postShortDescriptionConstraints.maxLength)
  shortDescription: string;

  @IsStringWithTrim(1, postContentConstraints.maxLength)
  content: string;
}
