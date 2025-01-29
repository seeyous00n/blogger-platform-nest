import { commentConstraints } from '../../domain/comment.entity';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';

export class UpdateCommentInputDto {
  @IsStringWithTrim(commentConstraints.minLength, commentConstraints.maxLength)
  content: string;
}
