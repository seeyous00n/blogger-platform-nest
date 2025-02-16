import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum UsersSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}

export class GetUsersQueryParams extends BaseSortablePaginationParams<UsersSortBy> {
  @IsString()
  @IsOptional()
  searchLoginTerm: string = '';

  @IsString()
  @IsOptional()
  searchEmailTerm: string = '';

  @IsEnum(UsersSortBy)
  sortBy = UsersSortBy.CreatedAt;
}
