import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { PostsController } from './posts/api/posts.controller';
import { CommentsController } from './comments/api/comments.controller';
import { PostsService } from './posts/application/posts.service';
import { CommentsService } from './comments/application/comments.service';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { Post, PostSchema } from './posts/domain/post.entity';

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
