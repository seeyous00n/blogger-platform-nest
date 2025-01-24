import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../user-accounts/domain/user.entity';
import {
  Blog,
  BlogModelType,
} from '../bloggers-platform/blogs/domain/blog.entity';
import {
  Post,
  PostModelType,
} from '../bloggers-platform/posts/domain/post.entity';
import {
  Session,
  SessionModelType,
} from '../user-accounts/domain/session.entity';
import {
  Like,
  LikeModelType,
} from '../bloggers-platform/likes/domain/like.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Session.name) private SessionModel: SessionModelType,
    @InjectModel(Like.name) private LikeModel: LikeModelType,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await this.UserModel.deleteMany();
    await this.BlogModel.deleteMany();
    await this.PostModel.deleteMany();
    await this.SessionModel.deleteMany();
    await this.LikeModel.deleteMany();
  }
}
