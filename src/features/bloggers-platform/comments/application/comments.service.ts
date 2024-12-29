import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comment.entity';
import { CommentsRepository } from '../infrastructure/comments.repository';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
  ) {}
  async createComment() {}
  async updateComment() {}

  async deleteComment(id: string) {
    const comment = await this.commentsRepository.findById(id);
    comment.makeDeleted();
    await this.commentsRepository.save(comment);
  }
}
