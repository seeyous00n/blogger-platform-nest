import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateLikeDto } from '../dto/create-like.dto';
import { UpdateLikeStatusDto } from '../dto/update-like-status.dto';

export enum MyStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: String, enum: MyStatus, required: true })
  status: MyStatus;

  @Prop({ type: String, required: true })
  authorId: string;

  @Prop({ type: String, required: true })
  parentId: string;

  @Prop({ type: String, required: true })
  authorLogin: string;

  @Prop({ type: Number, required: true })
  isNewLike: number;

  @Prop({ type: Date })
  createdAt: Date;

  static createInstance(dto: CreateLikeDto): LikeDocument {
    const like = new this();
    like.status = dto.likeStatus;
    like.authorId = dto.authorId;
    like.parentId = dto.parentId;
    like.authorLogin = dto.authorLogin;
    like.isNewLike = dto.likeStatus === MyStatus.Like ? 1 : 0;

    return like as LikeDocument;
  }

  update(dto: UpdateLikeStatusDto) {
    this.status = dto.likeStatus;
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.loadClass(Like);

export type LikeDocument = HydratedDocument<Like>;

export type LikeModelType = Model<LikeDocument> & typeof Like;
