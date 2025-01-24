import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateCommentByPostInputDTO } from '../../src/features/bloggers-platform/comments/api/input-dto/create-comment.input-dto';
import { CommentViewDto } from '../../src/features/bloggers-platform/comments/api/view-dto/comment-view.dto';
import * as request from 'supertest';
export class CommentTestManager {
  constructor(private app: INestApplication) {}

  async createComment(
    model: CreateCommentByPostInputDTO,
    postId: string,
    accessToken: string,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<CommentViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .auth(accessToken, { type: 'bearer' })
      .send(model)
      .expect(statusCode);

    return response.body;
  }

  async deleteComment(
    id: string,
    accessToken: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .delete(`/comments/${id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);
  }

  async getComment(
    id: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<CommentViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(`/comments/${id}`)
      .expect(statusCode);

    return response.body;
  }

  async createSeveralComments(
    postId: string,
    count: number,
    accessToken: string,
  ) {
    const comments: Promise<CommentViewDto>[] = [];

    for (let i = 0; i < count; i++) {
      const comment = this.createComment(
        {
          content: `${i} comment content comment content comment content`,
        },
        postId,
        accessToken,
      );

      comments.push(comment);
    }

    return await Promise.all(comments);
  }
}
