import { commentUpdateConstraints } from '../../domain/comment.entity';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';

export class UpdatePostInput {
  @IsStringWithTrim(
    commentUpdateConstraints.minLength,
    commentUpdateConstraints.maxLength,
  )
  content: string;
}
