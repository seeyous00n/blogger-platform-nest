import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { BlogsSqlRepository } from '../infrastructure/blogs-sql.repository';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exception';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog = await this.blogsSqlRepository.create(dto);
    return blog.id;
  }

  async updateBlog(id: string, dto: UpdateBlogDto): Promise<void> {
    const blog = await this.blogsSqlRepository.findById(id);
    if (!blog) throw NotFoundDomainException.create();

    blog.update(dto);
    await this.blogsSqlRepository.save(blog);
  }

  async deleteBlog(id: string): Promise<void> {
    const blog = await this.blogsSqlRepository.findById(id);
    if (!blog) throw NotFoundDomainException.create();

    blog.makeDeleted();
    await this.blogsSqlRepository.save(blog);
  }

  async getBlogId(id: string): Promise<string> {
    const blog = await this.blogsSqlRepository.findById(id);
    if (!blog) throw NotFoundDomainException.create();

    return blog.id;
  }
}
