import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionModelType } from '../../domain/session.entity';
import { SecurityViewDto } from '../../api/view-dto/security.view-dto';

@Injectable()
export class SecurityQueryRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}

  async getAllDevices(userId: string): Promise<SecurityViewDto[]> {
    const session = await this.SessionModel.find({ userId });

    return session.map((item) => SecurityViewDto.mapToView(item));
  }
}
