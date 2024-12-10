type PaginationViewType<T> = {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  items: T;
};

export abstract class PaginationViewDto<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;

  public static mapToView<T>(
    data: PaginationViewType<T>,
  ): PaginationViewDto<T> {
    return {
      pagesCount: Math.ceil(data.totalCount / data.pageSize),
      page: data.pageNumber,
      pageSize: data.pageSize,
      totalCount: data.totalCount,
      items: data.items,
    };
  }
}
