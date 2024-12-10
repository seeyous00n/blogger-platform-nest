export enum UsersSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

class PaginationParams {
  pageNumber: number = 1;
  pageSize: number = 10;
  sortDirection: SortDirection = SortDirection.Desc;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export abstract class BaseSortablePaginationParams<T> extends PaginationParams {
  sortDirection: SortDirection = SortDirection.Desc;
  abstract sortBy: T;
}

export class GetUsersQueryParams extends BaseSortablePaginationParams<UsersSortBy> {
  searchLoginTerm: string | null = null;
  searchEmailTerm: string | null = null;
  sortBy = UsersSortBy.CreatedAt;
}
