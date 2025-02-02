import { Injectable } from '@nestjs/common';
import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../core/exceptions/domain-exception';
import { DeleteSessionDto } from '../dto/delete-session.dto';
import { AuthSqlRepository } from '../infrastructure/auth-sql.repository';

@Injectable()
export class SecurityService {
  constructor(private authSqlRepository: AuthSqlRepository) {}

  async checkOwnerDeviceOrError(data: DeleteSessionDto) {
    const isSession = await this.authSqlRepository.findByDeviceId(
      data.deviceId,
    );
    if (!isSession) {
      throw NotFoundDomainException.create();
    }

    const session = await this.authSqlRepository.findByDeviceIdAndUserId(data);
    if (!session) {
      throw ForbiddenDomainException.create();
    }

    return session;
  }
}
