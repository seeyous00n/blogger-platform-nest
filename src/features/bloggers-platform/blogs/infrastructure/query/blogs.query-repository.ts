import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../domain/blog.entity';
import { BlogViewDto } from '../../api/view-dto/blog-view.dto';
import { GetBlogQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { DeletionStatus } from '../../../../../core/types/enums';

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

    const blogs = await this.BlogModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.BlogModel.countDocuments(filter);

    const items = blogs.map(BlogViewDto.mapToView);

    return PaginationViewDto.mapToView({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
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
