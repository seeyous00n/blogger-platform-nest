import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { PostsController } from './posts/api/posts.controller';
import { CommentsController } from './comments/api/comments.controller';
import { PostsService } from './posts/application/posts.service';
import { CommentsService } from './comments/application/comments.service';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { Post, PostSchema } from './posts/domain/post.entity';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { BlogIdIsExistConstraint } from '../../core/decorators/validation/login-is-exist.decorator';
import { JwtModule } from '@nestjs/jwt';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { LikeHelper } from './likes/like.helper';
import { Like, LikeSchema } from './likes/domain/like.entity';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { LikesRepository } from './likes/infrastructure/likes.repository';
import { LikeStatusCommentsUseCase } from './likes/application/usecases/like-status-comments.usecase';
import { LikeStatusPostsUseCase } from './likes/application/usecases/like-status-posts.usecase';
import { UserAccountsConfig } from '../user-accounts/config/user-accounts.config';
import { BlogsSqlRepository } from './blogs/infrastructure/blogs-sql.repository';
import { BlogsSqlQueryRepository } from './blogs/infrastructure/query/blogs-sql.query-repository';
import { PostsSqlRepository } from './posts/infrastructure/posts-sql.repository';
import { PostsSqlQueryRepository } from './posts/infrastructure/query/posts-sql.query-repository';
import { AdminBlogsController } from './blogs/api/admin.blogs.controller';

const useCases = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  LikeStatusCommentsUseCase,
  LikeStatusPostsUseCase,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
    JwtModule,
    UserAccountsModule,
  ],
  controllers: [
    BlogsController,
    PostsController,
    CommentsController,
    AdminBlogsController,
  ],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsSqlRepository,
    BlogsSqlQueryRepository,
    PostsService,
    PostsRepository,
    PostsSqlRepository,
    PostsSqlQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    BlogIdIsExistConstraint,
    ...useCases,
    LikeHelper,
    LikesRepository,
    UserAccountsConfig,
  ],
  exports: [MongooseModule],
})
export class BloggersPlatformModule {}
