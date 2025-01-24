import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';
import { CommentsRepository } from '../infrastructure/comments.repository';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../core/exceptions/domain-exception';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
  ) {}

  async checkOwnerComment(
    commentId: string,
    userId: string,
  ): Promise<CommentDocument> {
    const comment = await this.commentsRepository.findById(commentId);
    if (!comment) {
      throw NotFoundDomainException.create();
    }

    const result = await this.commentsRepository.findByIdAndUserId(
      commentId,
      userId,
    );
    if (!result) {
      throw ForbiddenDomainException.create();
    }

    return comment;
  }
}
