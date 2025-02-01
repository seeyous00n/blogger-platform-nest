import { UserDocument } from '../../domain/user.entity';
import { UserSearchResultSqlDto } from '../../dto/sql-dto/user-search-result.sql-dto';

// export class UserViewDto {
//   id: string;
//   login: string;
//   email: string;
//   createdAt: Date;
//
//   static mapToView(user: UserDocument): UserViewDto {
//     const dto = new UserViewDto();
//     dto.id = user._id.toString();
//     dto.login = user.login;
//     dto.email = user.email;
//     dto.createdAt = user.createdAt;
//
//     return dto;
//   }
// }

export class UserSqlViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: UserSearchResultSqlDto): UserViewDto {
    const dto = new UserViewDto();
    dto.id = String(user.id);
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.created_at;

    return dto;
  }
}

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: UserDocument): UserViewDto {
    const dto = new UserViewDto();
    dto.id = user._id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt;

    return dto;
  }
}

export class UserViewAuthDto {
  userId: string;
  login: string;
  email: string;

  static mapToView(user: UserDocument): UserViewAuthDto {
    const dto = new UserViewAuthDto();
    dto.userId = user._id.toString();
    dto.login = user.login;
    dto.email = user.email;

    return dto;
  }
}
