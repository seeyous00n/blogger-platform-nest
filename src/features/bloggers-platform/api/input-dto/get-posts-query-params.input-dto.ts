import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';

export enum PostsSortBy {
  CreatedAt = 'createdAt',
  id = 'id',
  title = 'title',
  shortDescription = 'shortDescription',
  content = 'content',
  blogId = 'blogId',
}

export class GetPostsQueryParams extends BaseSortablePaginationParams<PostsSortBy> {
  sortBy: PostsSortBy.CreatedAt;
}
