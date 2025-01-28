import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog = this.BlogModel.createInstance(dto);
    await this.blogsRepository.save(blog);

    return blog._id.toString();
  }

  async updateBlog(id: string, dto: UpdateBlogDto): Promise<void> {
    const blog = await this.blogsRepository.findOneOrNotFoundError(id);
    blog.update(dto);
    await this.blogsRepository.save(blog);
  }

  async deleteBlog(id: string): Promise<void> {
    const blog = await this.blogsRepository.findOneOrNotFoundError(id);
    blog.makeDeleted();
    await this.blogsRepository.save(blog);
  }

  async getBlogId(id: string): Promise<string> {
    const blog = await this.blogsRepository.findOneOrNotFoundError(id);
    return blog._id.toString();
  }
}
