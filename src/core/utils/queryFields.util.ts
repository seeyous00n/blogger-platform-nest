import { FilterQuery } from 'mongoose';

type queryStringType = {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
};

type filterReturnType = {
  sort: { [p: string]: number };
  skip: number;
  limit: number;
  pageNumber: number;
  pageSize: number;
};

export abstract class QueryFieldsUtil {
  static queryPagination(
    queryString: queryStringType,
  ): FilterQuery<filterReturnType> {
    const sortBy = queryString.sortBy || 'createdAt';
    const sortDirection = queryString.sortDirection || 'desc';
    const pageNumber = +queryString.pageNumber || 1;
    const pageSize = +queryString.pageSize || 10;

    return {
      sort: { [sortBy]: sortDirection === 'asc' ? 1 : -1 },
      skip: (pageNumber - 1) * pageSize,
      limit: pageSize,
      pageNumber,
      pageSize,
    };
  }
}
