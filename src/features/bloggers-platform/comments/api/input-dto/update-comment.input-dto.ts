import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import { commentConstraints } from '../../domain/comment.sql-entity';

export class UpdateCommentInputDto {
  @IsStringWithTrim(commentConstraints.minLength, commentConstraints.maxLength)
  content: string;
}
