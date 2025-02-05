import { Injectable } from '@nestjs/common';
import { UpdatePostDto } from '../dto/update-post.dto';
import { CreatePostDto } from '../dto/create-post.dto';
import { BlogsSqlRepository } from '../../blogs/infrastructure/blogs-sql.repository';
import { PostsSqlRepository } from '../infrastructure/posts-sql.repository';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exception';

@Injectable()
export class PostsService {
  constructor(
    private blogsSqlRepository: BlogsSqlRepository,
    private postsSqlRepository: PostsSqlRepository,
  ) {}

  async createPost(dto: CreatePostDto) {
    const blog = await this.blogsSqlRepository.findById(dto.blogId);
    if (!blog) throw NotFoundDomainException.create();

    const post = await this.postsSqlRepository.create({
      ...dto,
    });
    if (!post) throw NotFoundDomainException.create();

    return post.id;
  }

  async updatePost(id: string, dto: UpdatePostDto) {
    const post = await this.postsSqlRepository.findById(id);
    if (!post) throw NotFoundDomainException.create();

    post.update(dto);

    await this.postsSqlRepository.save(post);
  }

  async deletePost(id: string) {
    const post = await this.postsSqlRepository.findById(id);
    if (!post) throw NotFoundDomainException.create();

    post.makeDeleted();
    await this.postsSqlRepository.save(post);
  }

  async getPostId(id: string) {
    const post = await this.postsSqlRepository.findById(id);
    if (!post) throw NotFoundDomainException.create();

    return post.id;
  }
}
