import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../infrastructure/auth.repository';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exception';
import { DeleteSessionDto } from '../dto/delete-session.dto';

@Injectable()
export class SecurityService {
  constructor(private authRepository: AuthRepository) {}

  async checkOwnerDeviceOrError(data: DeleteSessionDto) {
    const isSession = await this.authRepository.findByDeviceId(data.deviceId);
    if (!isSession) {
      throw NotFoundDomainException.create();
    }

    const session = await this.authRepository.findByDeviceIdAndUserId(data);
    if (!session) {
      throw ForbiddenDomainException.create();
    }

    return session;
  }
}
