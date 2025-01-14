import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

//TODO Дима рекомендует не делать эти валидации в пайпах, лучше это все делать в сервисах
@Injectable()
export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (!isValidObjectId(value)) {
      throw new HttpException(
        `ObjectId must be an ObjectId (${value}) `,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value;
  }
}
