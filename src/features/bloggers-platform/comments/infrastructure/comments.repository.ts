import { Injectable } from '@nestjs/common';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from '../../../user-accounts/domain/user.entity';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exception';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async findById(id: string) {
    return this.CommentModel.findById({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }

  async findOneOrNotFoundError(id: string): Promise<CommentDocument> {
    const comment = await this.findById(id);

    if (!comment) throw NotFoundDomainException.create('comment not found');

    return comment;
  }
}
