import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

class PaginationParams {
  @Type(() => Number)
  pageNumber: number = 1;

  @Type(() => Number)
  pageSize: number = 10;

  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.Desc;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export abstract class BaseSortablePaginationParams<T> extends PaginationParams {
  abstract sortBy: T;
}
