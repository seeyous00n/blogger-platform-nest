import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeletionStatus,
  User,
  UserDocument,
  UserModelType,
} from '../domain/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private UserModel: Model<UserModelType>,
  ) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async save(user: UserDocument) {
    await user.save();
  }

  async findOneOrNotFoundError(id: string): Promise<UserDocument> {
    const user = this.findById(id);
    if (!user) throw new NotFoundException('user not found');

    return user;
  }
}
