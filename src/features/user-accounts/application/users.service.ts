import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
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

  // async createUser(dto: CreateUserDto) {
  //   await this.checkUniqueEmailAndLogin(dto);
  //
  //   const passwordHash = await this.cryptoService.generatePasswordHash(
  //     dto.password,
  //   );
  //   const user = this.UserModel.createInstance({
  //     email: dto.email,
  //     login: dto.login,
  //     hash: passwordHash,
  //   });
  //
  //   await this.usersRepository.save(user);
  //
  //   return user._id.toString();
  // }

  async createUser(dto: CreateUserDto) {
    await this.checkUniqueEmailAndLogin(dto);

    const passwordHash = await this.cryptoService.generatePasswordHash(
      dto.password,
    );
    const user = CreateUserSqlDto.mapToSql({
      email: dto.email,
      login: dto.login,
      hash: passwordHash,
    });

    const userId = await this.usersSqlRepository.create(user);

    return userId[0].id;
  }

  // async deleteUser(id: string) {
  //   const user = await this.usersRepository.findOneOrNotFoundError(id);
  //   user.makeDeleted();
  //   await this.usersRepository.save(user);
  // }

  async deleteUser(id: string) {
    const user = await this.usersSqlRepository.findById(id);
    if (!user.length) throw NotFoundDomainException.create();

    await this.usersSqlRepository.makeDeleted(user[0].id);
  }

  // async updateIsConfirmed(id: string) {
  //   const user = await this.usersRepository.findOneOrNotFoundError(id);
  //   user.emailConfirmation.isConfirmed = true;
  //   await this.usersRepository.save(user);
  // }

  async updateIsConfirmed(id: string) {
    const user = await this.usersSqlRepository.findById(id);
    if (!user[0]) throw NotFoundDomainException.create();

    await this.usersSqlRepository.updateIsConfirmedCode(id);
  }

  // async checkUniqueEmailAndLogin(data: Omit<CreateUserDto, 'password'>) {
  //   const userData = await this.usersRepository.findUserByEmailOrLogin(data);
  //   if (userData && userData.email === data.email) {
  //     throw BadRequestDomainException.create('Email already exists', 'email');
  //   }
  //   if (userData && userData.login === data.login) {
  //     throw BadRequestDomainException.create('Login already exists', 'login');
  //   }
  // }
  async checkUniqueEmailAndLogin(data: Omit<CreateUserDto, 'password'>) {
    const userData = await this.usersSqlRepository.findUserByEmailOrLogin(data);
    if (userData.length && userData[0].email === data.email) {
      throw BadRequestDomainException.create('Email already exists', 'email');
    }
    if (userData.length && userData[0].login === data.login) {
      throw BadRequestDomainException.create('Login already exists', 'login');
    }
  }
}
