import { Injectable } from '@nestjs/common';
import { DeletionStatus } from '../../../../../core/types/enums';
import { CommentModelType, Comment } from '../../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLeanDto,
  CommentViewDto,
} from '../../api/view-dto/comment-view.dto';
import { LikeHelper } from '../../../likes/like.helper';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { FilterQuery } from 'mongoose';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private likeHelper: LikeHelper,
  ) {}

  async getAll(
    query: GetCommentsQueryParams,
    authorId: string | null,
    id?: string,
  ) {
    const filter: FilterQuery<Comment> = {
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    };

    if (id) {
      filter.postId = id;
    }

    const comments = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize)
      .lean<CommentLeanDto[]>();

    const totalCount = await this.CommentModel.countDocuments(filter);

    const commentsWithLikes = await this.likeHelper.getCommentsWithLikes(
      comments,
      authorId,
    );

    return PaginationViewDto.mapToView({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items: commentsWithLikes,
    });
  }

  async getById(id: string, authorId?: string): Promise<CommentViewDto | null> {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    }).lean<CommentLeanDto>();

    if (!comment) {
      return null;
    }
    const commentWithLike = await this.likeHelper.getCommentWithLike(
      comment,
      authorId,
    );

    return CommentViewDto.mapToView(commentWithLike);
  }
}
