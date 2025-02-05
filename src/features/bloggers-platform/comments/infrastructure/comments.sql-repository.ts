import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Comment } from '../domain/comment.sql-entity';
import { CreateSqlCommentDto } from '../dto/sql-dto/create-comment.sql-dto';

@Injectable()
export class CommentsSqlRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async findById(id: string) {
    const sqlQuery = `SELECT *
                          FROM "comment"
                          WHERE id = $1
                            AND deletion_status = false`;
    const result = await this.datasource.query(sqlQuery, [id]);
    if (!result.length) {
      return null;
    }

    return Comment.createInstance(result[0]);
  }

  async create(data: CreateSqlCommentDto) {
    const sqlQuery = `INSERT INTO "comment" (post_id, content, user_id)
                          VALUES ($1, $2, $3) RETURNING id`;
    const result = await this.datasource.query(sqlQuery, [
      data.postId,
      data.content,
      data.userId,
    ]);

    return result[0];
  }

  async save(comment: Comment): Promise<void> {
    const sqlQuery = `UPDATE "comment"
                          SET post_id         = $2,
                              user_id         = $3,
                              content         = $4,
                              deletion_status = $5
                          WHERE id = $1`;

    await this.datasource.query(sqlQuery, [
      comment.id,
      comment.postId,
      comment.userId,
      comment.content,
      comment.deletionStatus,
    ]);
  }

  async findByIdAndUserId(id: string, userId: string) {
    const sqlQuery = `SELECT *
                          FROM "comment"
                          WHERE id = $1
                            AND user_id = $2
                            AND deletion_status = false`;
    const result = await this.datasource.query(sqlQuery, [id, userId]);
    if (!result.length) {
      return null;
    }

    return Comment.createInstance(result[0]);
  }
}
