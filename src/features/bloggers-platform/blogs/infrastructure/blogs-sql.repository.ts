import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blog } from '../domain/blog.sql-entity';
import { CreateBlogDto } from '../dto/create-blog.dto';

@Injectable()
export class BlogsSqlRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async findById(id: string) {
    const sqlQuery = `SELECT *
                          FROM blog
                          WHERE id = $1
                            AND deletion_status = false`;
    const result = await this.datasource.query(sqlQuery, [id]);
    if (!result.length) {
      return null;
    }

    return Blog.createInstance(result[0]);
  }

  async create(data: CreateBlogDto) {
    const sqlQuery = `INSERT INTO "blog" (name, description, website_url)
                          VALUES ($1, $2, $3) RETURNING id`;
    const result = await this.datasource.query(sqlQuery, [
      data.name,
      data.description,
      data.websiteUrl,
    ]);

    return result[0];
  }

  async save(blog: Blog): Promise<void> {
    const sqlQuery = `UPDATE "blog"
                      SET name            = $2,
                          description     = $3,
                          website_url     = $4,
                          is_membership   = $5,
                          deletion_status = $6
                      WHERE id = $1`;

    await this.datasource.query(sqlQuery, [
      blog.id,
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.isMembership,
      blog.deletionStatus,
    ]);
  }
}
