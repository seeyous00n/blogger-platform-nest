import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { DeletionStatus } from '../../../../../core/types/enums';
import { PostLeanDto, PostViewDto } from '../../api/view-dto/post.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { LikeHelper } from '../../../likes/like.helper';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private likeHelper: LikeHelper,
  ) {}

  async getAll(
    query: GetPostsQueryParams,
    authorId: string | null,
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
      .limit(query.pageSize)
      .lean<PostLeanDto[]>();

    const totalCount = await this.PostModel.countDocuments(filter);

    const postsWithLikes = await this.likeHelper.getPostsWithLikes(
      posts,
      authorId,
    );

    return PaginationViewDto.mapToView({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items: postsWithLikes,
    });
  }

  async getById(id: string, authorId?: string): Promise<PostViewDto | null> {
    const post: PostLeanDto = await this.PostModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    }).lean<PostLeanDto>();

    if (!post) {
      return null;
    }

    const postWithLike = await this.likeHelper.getPostWithLike(post, authorId);

    return PostViewDto.mapToView(postWithLike);
  }
}
