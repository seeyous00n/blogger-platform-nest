import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserInstanceDto } from '../dto/create-user-instance.dto';

export enum DeletionStatus {
  NotDeleted = 'not-deleted',
  PermanentDeleted = 'permanent-deleted',
}

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

@Schema({ _id: false })
class PasswordHash {
  @Prop({ type: String, required: true })
  hash: string;

  @Prop({ type: String })
  recoveryCode?: string;

  @Prop({ type: Date })
  expirationDate?: Date;
}

@Schema({ _id: false })
class EmailConfirmation {
  @Prop({ type: String })
  confirmationCode?: string;

  @Prop({ type: Boolean, required: true })
  isConfirmed: boolean;

  @Prop({ type: Date })
  expirationDate?: Date;
}

const PasswordHashSchema = SchemaFactory.createForClass(PasswordHash);
const emailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, ...loginConstraints })
  login: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: PasswordHashSchema })
  passwordHash: PasswordHash;

  @Prop({ type: emailConfirmationSchema })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  static createInstance(dto: CreateUserInstanceDto): UserDocument {
    const user = new this();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = {
      hash: dto.hash,
    };
    user.emailConfirmation = {
      isConfirmed: false,
    };

    return user as UserDocument;
  }

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Entity already deleted');
    }

    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & typeof User;
