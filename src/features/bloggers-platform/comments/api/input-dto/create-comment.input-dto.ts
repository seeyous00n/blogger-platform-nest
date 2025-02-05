import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import { commentConstraints } from '../../domain/comment.sql-entity';

export class CreateCommentInputDto {
  postId: string;
  userId: string;
  content: string;
}

export class CreateCommentByPostInputDTO {
  @IsStringWithTrim(commentConstraints.minLength, commentConstraints.maxLength)
  content: string;
}
