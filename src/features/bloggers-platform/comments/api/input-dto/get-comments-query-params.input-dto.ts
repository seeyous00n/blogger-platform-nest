import { BaseSortablePaginationParams } from '../../../../../core/dto/base.query-params.input-dto';
import { IsEnum } from 'class-validator';

export enum CommentsSortBy {
  CreatedAt = 'createdAt',
  Content = 'content',
}

export class GetCommentsQueryParams extends BaseSortablePaginationParams<CommentsSortBy> {
  @IsEnum(CommentsSortBy)
  sortBy = CommentsSortBy.CreatedAt;
}
