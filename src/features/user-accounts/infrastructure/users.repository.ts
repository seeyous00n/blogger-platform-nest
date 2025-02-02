import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeletionStatus,
  User,
  UserDocument,
  UserModelType,
} from '../domain/user.entity';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exception';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async findOneOrNotFoundError(id: string): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) throw NotFoundDomainException.create();

    return user;
  }
}
