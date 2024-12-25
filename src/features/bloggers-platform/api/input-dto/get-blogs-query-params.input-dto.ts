import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';

export enum BlogsSortBy {
  CreatedAt = 'createdAt',
  name = 'name',
  description = 'description',
  websiteUrl = 'websiteUrl',
}

export class GetBlogQueryParams extends BaseSortablePaginationParams<BlogsSortBy> {
  searchNameTerm: string | null = null;
  sortBy = BlogsSortBy.CreatedAt;
}
