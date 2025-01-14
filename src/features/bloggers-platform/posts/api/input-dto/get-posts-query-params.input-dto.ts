import { BaseSortablePaginationParams } from '../../../../../core/dto/base.query-params.input-dto';
import { IsEnum } from 'class-validator';

export enum PostsSortBy {
  CreatedAt = 'createdAt',
  Title = 'title',
  ShortDescription = 'shortDescription',
  Content = 'content',
  BlogId = 'blogId',
  BlogName = 'blogName',
}

export class GetPostsQueryParams extends BaseSortablePaginationParams<PostsSortBy> {
  @IsEnum(PostsSortBy)
  sortBy = PostsSortBy.CreatedAt;
}
