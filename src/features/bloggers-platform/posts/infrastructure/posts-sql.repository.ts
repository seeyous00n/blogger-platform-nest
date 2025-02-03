import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post } from '../domain/post.sql-entity';
import { CreatePostDto } from '../dto/create-post.dto';

@Injectable()
export class PostsSqlRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async findById(id: string) {
    const sqlQuery = `SELECT *
                          FROM post
                          WHERE id = $1
                            AND deletion_status = false`;
    const result = await this.datasource.query(sqlQuery, [id]);
    if (!result.length) {
      return null;
    }

    return Post.createInstance(result[0]);
  }

  async create(data: CreatePostDto) {
    const sqlQuery = `INSERT INTO "post" (title, short_description, content, blog_id, blog_name)
                          VALUES ($1, $2, $3, $4, $5) RETURNING id`;
    const result = await this.datasource.query(sqlQuery, [
      data.title,
      data.shortDescription,
      data.content,
      data.blogId,
      data.blogName,
    ]);

    return result[0];
  }

  async save(post: Post): Promise<void> {
    const sqlQuery = `UPDATE "post"
                          SET title             = $2,
                              short_description = $3,
                              content           = $4,
                              blog_id           = $5,
                              blog_name         = $6,
                              deletion_status   = $7
                          WHERE id = $1`;

    await this.datasource.query(sqlQuery, [
      post.id,
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.deletionStatus,
    ]);
  }
}
