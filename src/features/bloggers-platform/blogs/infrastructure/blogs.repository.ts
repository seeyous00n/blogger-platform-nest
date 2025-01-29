import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { DeletionStatus } from '../../../user-accounts/domain/user.entity';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exception';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }

  async findOneOrNotFoundError(id: string): Promise<BlogDocument> {
    const blog = await this.findById(id);

    if (!blog) throw NotFoundDomainException.create();

    return blog;
  }
}
