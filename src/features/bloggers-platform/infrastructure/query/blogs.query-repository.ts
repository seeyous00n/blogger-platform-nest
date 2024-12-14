import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../domain/blog.entity';
import { BlogViewDto } from '../../api/view-dto/blog-view.dto';
import { GetBlogQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { QueryFieldsUtil } from '../../../../core/utils/queryFields.util';
import { DeletionStatus } from '../../../../core/types/enums';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async getAll(
    query: GetBlogQueryParams,
  ): Promise<PaginationViewDto<BlogViewDto[]>> {
    const filter: FilterQuery<Blog> = query.searchNameTerm
      ? {
          name: {
            $regex: query.searchNameTerm,
            $options: 'i',
          },
        }
      : {};

    const queryHelper = QueryFieldsUtil.queryPagination(query);

    const blogs = await this.BlogModel.find(filter)
      .sort(queryHelper.sort)
      .skip(queryHelper.skip)
      .limit(queryHelper.limit);

    const totalCount = await this.BlogModel.countDocuments(filter);

    const items = blogs.map(BlogViewDto.mapToView);

    return PaginationViewDto.mapToView({
      pageNumber: queryHelper.pageNumber,
      pageSize: queryHelper.pageSize,
      totalCount,
      items,
    });
  }

  async getByIdOrNotFoundError(id: string): Promise<BlogViewDto> {
    const blog = await this.BlogModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    return BlogViewDto.mapToView(blog);
  }
}
