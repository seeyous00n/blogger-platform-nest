import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: Number, required: true })
  tokenIat: number;

  @Prop({ type: Number, required: true })
  tokenExp: number;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: Date, required: true })
  lastActiveDate: Date;

  static createInstance(dto: CreateSessionDto): SessionDocument {
    const session = new this();
    session.userId = dto.userId;
    session.tokenIat = dto.tokenIat;
    session.tokenExp = dto.tokenExp;
    session.ip = dto.ip;
    session.title = dto.title;
    session.deviceId = dto.deviceId;
    session.lastActiveDate = new Date(dto.tokenIat * 1000);

    return session as SessionDocument;
  }

  update(dto: UpdateSessionDto) {
    this.tokenIat = dto.tokenIat;
    this.tokenExp = dto.tokenExp;
    this.lastActiveDate = new Date(dto.tokenIat * 1000);
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.loadClass(Session);

export type SessionDocument = HydratedDocument<Session>;

export type SessionModelType = Model<SessionDocument> & typeof Session;
