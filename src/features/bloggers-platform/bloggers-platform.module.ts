import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './domain/blog.entity';
import { BlogsController } from './api/blogs.controller';
import { BlogsService } from './application/blogs.service';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsQueryRepository } from './infrastructure/query/blogs.query-repository';
import { PostsController } from './api/posts.controller';
import { CommentsController } from './api/comments.controller';
import { PostsService } from './application/posts.service';
import { CommentsService } from './application/comments.service';
import { PostsRepository } from './infrastructure/posts.repository';
import { CommentsRepository } from './infrastructure/comments.repository';
import { PostsQueryRepository } from './infrastructure/query/posts.query-repository';
import { CommentsQueryRepository } from './infrastructure/query/comments.query-repository';
import { Post, PostSchema } from './domain/post.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
  ],
  exports: [MongooseModule],
})
export class BloggersPlatformModule {}
