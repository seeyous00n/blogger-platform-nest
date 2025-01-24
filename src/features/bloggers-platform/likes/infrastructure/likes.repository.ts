import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument, LikeModelType } from '../domain/like.entity';
import { ParentAndAuthorDto } from '../dto/parent-and-author.dto';

@Injectable()
export class LikesRepository {
  constructor(@InjectModel(Like.name) private LikeModel: LikeModelType) {}

  async findOne(model: ParentAndAuthorDto) {
    return this.LikeModel.findOne({
      parentId: model.parentId,
      authorId: model.authorId,
    });
  }

  async save(like: LikeDocument): Promise<void> {
    await like.save();
  }
}
