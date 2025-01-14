import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DeletionStatus } from '../../../../core/types/enums';
import { CreatePostDto } from '../dto/create-post.dto';
import { HydratedDocument, Model } from 'mongoose';
import { UpdatePostDto } from '../dto/update-post.dto';

export const postTitleConstraints = {
  maxLength: 30,
};
export const postShortDescriptionConstraints = {
  maxLength: 100,
};
export const postContentConstraints = {
  maxLength: 1000,
};

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, required: true, ...postTitleConstraints })
  title: string;

  @Prop({ type: String, required: true, ...postShortDescriptionConstraints })
  shortDescription: string;

  @Prop({ type: String, required: true, ...postContentConstraints })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  static createInstance(dto: CreatePostDto): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;

    return post as PostDocument;
  }

  update(dto: UpdatePostDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
  }

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Entity already deleted');
    }

    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & typeof Post;
