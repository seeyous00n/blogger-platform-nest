import { Injectable } from '@nestjs/common';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../core/exceptions/domain-exception';
import { CommentsSqlRepository } from '../infrastructure/comments.sql-repository';
import { Comment } from '../domain/comment.sql-entity';

@Injectable()
export class CommentsService {
  constructor(private commentsSqlRepository: CommentsSqlRepository) {}

  async checkOwnerComment(commentId: string, userId: string): Promise<Comment> {
    const comment = await this.commentsSqlRepository.findById(commentId);
    if (!comment) {
      throw NotFoundDomainException.create();
    }

    const result = await this.commentsSqlRepository.findByIdAndUserId(
      commentId,
      userId,
    );
    if (!result) {
      throw ForbiddenDomainException.create();
    }

    return comment;
  }
}
