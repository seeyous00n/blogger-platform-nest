import { Injectable } from '@nestjs/common';
import { DeletionStatus, User, UserModelType } from '../../domain/user.entity';
import { UserViewAuthDto, UserViewDto } from '../../api/view-dto/user.view-dto';
import { InjectModel } from '@nestjs/mongoose';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginationViewDto<UserViewDto[]>> {
    const filter: FilterQuery<User> = {
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    };

    if (query.searchLoginTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        login: {
          $regex: query.searchLoginTerm,
          $options: 'i',
        },
      });
    }
    if (query.searchEmailTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        email: {
          $regex: query.searchEmailTerm,
          $options: 'i',
        },
      });
    }

    const users = await this.UserModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.UserModel.countDocuments(filter);

    const items = users.map(UserViewDto.mapToView);

    return PaginationViewDto.mapToView({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    });
  }

  async getByIdOrNotFoundError(id: string): Promise<UserViewDto | null> {
    const user = await this.UserModel.findById({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!user) {
      return null;
    }

    return UserViewDto.mapToView(user);
  }

  async getAuthUserByIdOrNotFoundError(
    id: string,
  ): Promise<UserViewAuthDto | null> {
    const user = await this.UserModel.findById({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!user) {
      return null;
    }

    return UserViewAuthDto.mapToView(user);
  }
}
