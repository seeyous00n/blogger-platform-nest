import { Injectable, NotFoundException } from '@nestjs/common';
import { DeletionStatus, User, UserModelType } from '../../domain/user.entity';
import { UserViewDto } from '../../api/view-dto/user-view.dto';
import { InjectModel } from '@nestjs/mongoose';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params-input.dto';
import { QueryFieldsUtil } from '../../../../core/utils/queryFields.util';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginationViewDto<UserViewDto[]>> {
    const filter: FilterQuery<User> = {};

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

    const fullFilter = {
      ...filter,
      deletionStatus: DeletionStatus.NotDeleted,
    };

    const queryHelper = QueryFieldsUtil.queryPagination(query);

    const users = await this.UserModel.find(fullFilter)
      .sort(queryHelper.sort)
      .skip(queryHelper.skip)
      .limit(queryHelper.limit);

    const totalCount = await this.UserModel.countDocuments(fullFilter);

    const items = users.map(UserViewDto.mapToView);

    return PaginationViewDto.mapToView({
      pageNumber: queryHelper.pageNumber,
      pageSize: queryHelper.pageSize,
      totalCount,
      items,
    });
  }

  async getByIdOrNotFoundError(id: string): Promise<UserViewDto> {
    const user = await this.UserModel.findById({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!user) throw new NotFoundException('user not found');

    return UserViewDto.mapToView(user);
  }
}
