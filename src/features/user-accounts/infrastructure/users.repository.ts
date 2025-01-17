import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeletionStatus,
  User,
  UserDocument,
  UserModelType,
} from '../domain/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
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

  async save(user: UserDocument): Promise<void> {
    await user.save();
  }

  async findOneOrNotFoundError(id: string): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) throw NotFoundDomainException.create();

    return user;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  }

  async findUserByEmailOrLogin(
    data: Omit<CreateUserDto, 'password'>,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ email: data.email }, { login: data.login }],
    });
  }

  async findByConfirmationCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async findByEmail(email: string) {
    return this.UserModel.findOne({ email: email });
  }

  async findByRecoveryCode(recoveryCode: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'passwordHash.recoveryCode': recoveryCode,
    });
  }
}
