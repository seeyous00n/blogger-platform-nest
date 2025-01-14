import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { CryptoService } from '../../../core/adapters/bcrypt/bcrypt.service';
import { BadRequestDomainException } from '../../../core/exceptions/domain-exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async createUser(dto: CreateUserDto) {
    await this.checkUniqueEmailAndLogin(dto);

    const passwordHash = await this.cryptoService.generatePasswordHash(
      dto.password,
    );
    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      hash: passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOneOrNotFoundError(id);
    user.makeDeleted();
    await this.usersRepository.save(user);
  }

  async updateIsConfirmed(id: string) {
    const user = await this.usersRepository.findOneOrNotFoundError(id);
    user.emailConfirmation.isConfirmed = true;
    await this.usersRepository.save(user);
  }

  async checkUniqueEmailAndLogin(data: Omit<CreateUserDto, 'password'>) {
    const userData = await this.usersRepository.findUserByEmailOrLogin(data);
    if (userData && userData.email === data.email) {
      throw BadRequestDomainException.create('Email already exists', 'email');
    }
    if (userData && userData.login === data.login) {
      throw BadRequestDomainException.create('Login already exists', 'login');
    }
  }
}
