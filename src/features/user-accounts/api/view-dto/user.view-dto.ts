import { UserDocument } from '../../domain/user.entity';
import { UserSearchResultSqlDto } from '../../dto/sql-dto/user-search-result.sql-dto';

export class UserSqlViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: UserSearchResultSqlDto): UserSqlViewDto {
    const dto = new UserSqlViewDto();
    dto.id = String(user.id);
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.created_at;

    return dto;
  }
}

export class UserSqlViewAuthDto {
  userId: string;
  login: string;
  email: string;

  static mapToView(user: UserDocument): UserSqlViewAuthDto {
    const dto = new UserSqlViewAuthDto();
    dto.userId = String(user.id);
    dto.login = user.login;
    dto.email = user.email;

    return dto;
  }
}
