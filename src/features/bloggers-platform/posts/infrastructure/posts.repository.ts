import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { DeletionStatus } from '../../../user-accounts/domain/user.entity';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exception';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findById(id: string) {
    return this.PostModel.findById({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }

  async findOneOrNotFoundError(id: string): Promise<PostDocument> {
    const post = await this.findById(id);

    if (!post) throw NotFoundDomainException.create('post not found');

    return post;
  }
}
