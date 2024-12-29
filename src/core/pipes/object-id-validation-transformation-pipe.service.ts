import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';

@Injectable()
export class ObjectIdValidationTransformationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (metadata.metatype === Types.ObjectId) {
      if (!isValidObjectId(value)) {
        //TODO create own exception!!!
        throw new Error(`ObjectId must be an ObjectId (${value}) `);
      }

      return new Types.ObjectId(value);
    }

    return value;
  }
}
