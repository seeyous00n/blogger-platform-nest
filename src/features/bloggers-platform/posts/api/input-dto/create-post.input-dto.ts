import { IsString } from 'class-validator';
import {
  postContentConstraints,
  postShortDescriptionConstraints,
  postTitleConstraints,
} from '../../domain/post.entity';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import { BlogIdIsExist } from '../../../../../core/decorators/validation/login-is-exist.decorator';

export class CreatePostInputDTO {
  @IsStringWithTrim(1, postTitleConstraints.maxLength)
  title: string;

  @IsStringWithTrim(1, postShortDescriptionConstraints.maxLength)
  shortDescription: string;

  @IsStringWithTrim(1, postContentConstraints.maxLength)
  content: string;

  @IsString()
  @BlogIdIsExist()
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
