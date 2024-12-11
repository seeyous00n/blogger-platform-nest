import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';

export enum UsersSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}

export class GetUsersQueryParams extends BaseSortablePaginationParams<UsersSortBy> {
  searchLoginTerm: string | null = null;
  searchEmailTerm: string | null = null;
  sortBy = UsersSortBy.CreatedAt;
}
