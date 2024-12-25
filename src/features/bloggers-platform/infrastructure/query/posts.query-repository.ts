import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../domain/post.entity';
import { Model } from 'mongoose';
import { DeletionStatus } from '../../../../core/types/enums';
import { PostViewDto } from '../../api/view-dto/post-view';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
  ) {}

  async getAll(
    query: GetPostsQueryParams,
    id?: string,
  ): Promise<PaginationViewDto<PostViewDto[]>> {
    const filter = id ? { blogId: id } : {};

    const posts = await this.postModel
      .find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.postModel.countDocuments(filter);

    const items = posts.map(PostViewDto.mapToView);

    return PaginationViewDto.mapToView({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    });
  }

  async getByIdOrNotFoundError(id: string): Promise<PostViewDto> {
    const post = await this.postModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!post) throw new NotFoundException('post not found');

    return PostViewDto.mapToView(post);
  }
}
