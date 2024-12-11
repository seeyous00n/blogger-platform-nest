import { Injectable } from '@nestjs/common';
import { CreateBlogInputDTO } from '../api/input-dto/create-blog.input-dto';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';
import { UpdateBlogInputDTO } from '../api/input-dto/update-blog.input-dto';

@Injectable()
export class BloggerService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private blogRepository: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogInputDTO) {
    const blog = this.BlogModel.createInstance(dto);
    await this.blogRepository.save(blog);

    return blog._id.toString();
  }

  async updateBlog(id: string, dto: UpdateBlogInputDTO) {
    const blog = await this.blogRepository.findOneOrNotFoundError(id);
    blog.update(dto);
    await this.blogRepository.save(blog);
  }

  async deleteBlog(id: string) {
    const blog = await this.blogRepository.findOneOrNotFoundError(id);
    blog.makeDeleted();
    await this.blogRepository.save(blog);
  }
}
