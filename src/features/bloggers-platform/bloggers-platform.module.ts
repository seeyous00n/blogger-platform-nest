import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { PostsController } from './posts/api/posts.controller';
import { CommentsController } from './comments/api/comments.controller';
import { PostsService } from './posts/application/posts.service';
import { CommentsService } from './comments/application/comments.service';
import { BlogIdIsExistConstraint } from '../../core/decorators/validation/login-is-exist.decorator';
import { JwtModule } from '@nestjs/jwt';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { LikeStatusCommentsUseCase } from './likes/application/usecases/like-status-comments.usecase';
import { LikeStatusPostsUseCase } from './likes/application/usecases/like-status-posts.usecase';
import { UserAccountsConfig } from '../user-accounts/config/user-accounts.config';
import { BlogsSqlRepository } from './blogs/infrastructure/blogs-sql.repository';
import { BlogsSqlQueryRepository } from './blogs/infrastructure/query/blogs-sql.query-repository';
import { PostsSqlRepository } from './posts/infrastructure/posts-sql.repository';
import { PostsSqlQueryRepository } from './posts/infrastructure/query/posts-sql.query-repository';
import { AdminBlogsController } from './blogs/api/admin.blogs.controller';
import { CommentsSqlQueryRepository } from './comments/infrastructure/query/comments.sql-query-repository';
import { CommentsSqlRepository } from './comments/infrastructure/comments.sql-repository';
import { LikesSqlRepository } from './likes/infrastructure/likes.sql-repository';

const useCases = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  LikeStatusCommentsUseCase,
  LikeStatusPostsUseCase,
];

@Module({
  imports: [JwtModule, UserAccountsModule],
  controllers: [
    BlogsController,
    PostsController,
    CommentsController,
    AdminBlogsController,
  ],
  providers: [
    BlogsService,
    BlogsSqlRepository,
    BlogsSqlQueryRepository,
    PostsService,
    PostsSqlRepository,
    PostsSqlQueryRepository,
    CommentsService,
    CommentsSqlRepository,
    CommentsSqlQueryRepository,
    BlogIdIsExistConstraint,
    ...useCases,
    LikesSqlRepository,
    UserAccountsConfig,
  ],
})
export class BloggersPlatformModule {}
