import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { PostsRepository } from '../infrastructure/posts.repository';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { UpdatePostDto } from '../dto/update-post.dto';
import { CreatePostDto } from '../dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async createPost(dto: Omit<CreatePostDto, 'blogName'>) {
    const blog = await this.blogsRepository.findOneOrNotFoundError(dto.blogId);
    const post = this.PostModel.createInstance({
      ...dto,
      blogName: blog.name,
    });
    await this.postsRepository.save(post);

    return post._id.toString();
  }

  async updatePost(id: string, dto: UpdatePostDto) {
    const post = await this.postsRepository.findOneOrNotFoundError(id);
    post.update(dto);
    await this.postsRepository.save(post);
  }

  async deletePost(id: string) {
    const post = await this.postsRepository.findOneOrNotFoundError(id);
    post.makeDeleted();
    await this.postsRepository.save(post);
  }

  async getPostId(id: string) {
    const post = await this.postsRepository.findOneOrNotFoundError(id);

    return post._id.toString();
  }
}
