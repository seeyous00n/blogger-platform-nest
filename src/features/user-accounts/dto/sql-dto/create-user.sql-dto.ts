import { CreateUserInstanceDto } from '../create-user-instance.dto';

export class CreateUserSqlDto {
  login: string;
  email: string;
  password_hash: string;

  static mapToSql(data: CreateUserInstanceDto) {
    const dto = new CreateUserSqlDto();
    dto.login = data.login;
    dto.email = data.email;
    dto.password_hash = data.hash;

    return dto;
  }
}
