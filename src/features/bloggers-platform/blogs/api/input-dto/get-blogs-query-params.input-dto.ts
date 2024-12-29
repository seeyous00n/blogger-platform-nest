import { BaseSortablePaginationParams } from '../../../../../core/dto/base.query-params.input-dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum BlogsSortBy {
  CreatedAt = 'createdAt',
  Name = 'name',
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
}

export class GetBlogQueryParams extends BaseSortablePaginationParams<BlogsSortBy> {
  @IsString()
  @IsOptional()
  searchNameTerm: string | null = null;

  @IsEnum(BlogsSortBy)
  sortBy = BlogsSortBy.CreatedAt;
}
