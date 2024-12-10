import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserInputDto } from '../api/input-dto/create-user-input.dto';
import { generatePasswordHash } from '../../../core/adapters/bcrypt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(dto: CreateUserInputDto) {
    const passwordHash = await generatePasswordHash(dto.password);
    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      password: passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOneOrNotFoundError(id);
    user.makeDeleted();
    await this.usersRepository.save(user);
  }
}
