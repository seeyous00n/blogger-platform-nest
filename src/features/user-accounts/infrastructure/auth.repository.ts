import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../domain/session.entity';
import { DeleteSessionDto } from '../dto/delete-session.dto';
import { DeleteSessionsDto } from '../dto/delete-sessions.dto';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}

  async findSessionByIatAndDeviceId(iat: number, deviceId: string) {
    return this.SessionModel.findOne({
      deviceId: deviceId,
      tokenIat: iat,
    });
  }

  async save(session: SessionDocument): Promise<void> {
    await session.save();
  }

  async delete(id: string): Promise<void> {
    await this.SessionModel.deleteOne({ _id: id });
  }

  async findByDeviceId(deviceId: string) {
    return this.SessionModel.findOne({ deviceId });
  }

  async findByDeviceIdAndUserId(data: DeleteSessionDto) {
    return this.SessionModel.findOne({
      deviceId: data.deviceId,
      userId: data.userId,
    });
  }

  async deleteAllExceptCurrent(data: DeleteSessionsDto) {
    await this.SessionModel.deleteMany({
      userId: data.userId,
      deviceId: { $ne: data.deviceId },
    });
  }
}
