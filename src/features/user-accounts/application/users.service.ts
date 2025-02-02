import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { CryptoService } from '../../../core/adapters/bcrypt/bcrypt.service';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exception';
import { UsersSqlRepository } from '../infrastructure/users-sql.repository';
import { CreateUserSqlDto } from '../dto/sql-dto/create-user.sql-dto';

@Injectable()
export class UsersService {
  constructor(
    private usersSqlRepository: UsersSqlRepository,
    private cryptoService: CryptoService,
  ) {}

  async createUser(dto: CreateUserDto) {
    await this.checkUniqueEmailAndLogin(dto);

    const passwordHash = await this.cryptoService.generatePasswordHash(
      dto.password,
    );
    const dataUser = CreateUserSqlDto.mapToSql({
      email: dto.email,
      login: dto.login,
      hash: passwordHash,
    });

    const newUser = await this.usersSqlRepository.create(dataUser);

    return newUser.id;
  }

  async deleteUser(id: string) {
    const user = await this.usersSqlRepository.findById(id);
    if (!user) throw NotFoundDomainException.create();

    user.makeDeleted();
    await this.usersSqlRepository.save(user);
  }

  async updateIsConfirmed(id: string) {
    const user = await this.usersSqlRepository.findById(id);

    user.emailIsConfirmed = true;
    await this.usersSqlRepository.save(user);
  }

  async checkUniqueEmailAndLogin(data: Omit<CreateUserDto, 'password'>) {
    const user = await this.usersSqlRepository.findUserByEmailOrLogin(data);

    if (user && user.email === data.email) {
      throw BadRequestDomainException.create('Email already exists', 'email');
    }
    if (user && user.login === data.login) {
      throw BadRequestDomainException.create('Login already exists', 'login');
    }
  }
}
