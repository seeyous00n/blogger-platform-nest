import { Injectable } from '@nestjs/common';
import { ParentAndAuthorDto } from '../dto/parent-and-author.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Like } from '../domain/like.sql-entity';
import { CreateLikeSqlDto } from '../dto/sql-dto/create-like.sql-dto';

@Injectable()
export class LikesSqlRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async findOne(model: ParentAndAuthorDto) {
    const sqlQuery = `
            SELECT *
            FROM "like"
            WHERE parent_id = $1
              AND author_id = $2`;
    const result = await this.datasource.query(sqlQuery, [
      model.parentId,
      model.authorId,
    ]);
    if (!result.length) {
      return null;
    }

    return Like.createInstance(result[0]);
  }

  async create(data: CreateLikeSqlDto) {
    const sqlQuery = `
            INSERT INTO "like" (status, author_id, parent_id, is_new_like)
            VALUES ($1, $2, $3, $4) RETURNING id`;
    const result = await this.datasource.query(sqlQuery, [
      data.likeStatus,
      data.authorId,
      data.parentId,
      data.isNewLike,
    ]);

    return result[0];
  }

  async save(like: Like): Promise<void> {
    const sqlQuery = `
            UPDATE "like"
            SET status      = $2,
                author_id   = $3,
                parent_id   = $4,
                is_new_like = $5
            WHERE id = $1`;

    await this.datasource.query(sqlQuery, [
      like.id,
      like.status,
      like.authorId,
      like.parentId,
      like.isNewLike,
    ]);
  }
}
