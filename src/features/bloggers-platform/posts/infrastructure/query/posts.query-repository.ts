import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { DeletionStatus } from '../../../../../core/types/enums';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async getAll(
    query: GetPostsQueryParams,
    id?: string,
  ): Promise<PaginationViewDto<PostViewDto[]>> {
    const filter: FilterQuery<Post> = {
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    };

    if (id) {
      filter.blogId = id;
    }

    const posts = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

    const items = posts.map(PostViewDto.mapToView);

    return PaginationViewDto.mapToView({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    });
  }

  async getByIdOrNotFoundError(id: string): Promise<PostViewDto | null> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!post) {
      return null;
    }

    return PostViewDto.mapToView(post);
  }
}
