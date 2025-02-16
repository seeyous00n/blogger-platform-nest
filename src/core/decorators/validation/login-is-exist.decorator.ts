import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsSqlRepository } from '../../../features/bloggers-platform/blogs/infrastructure/blogs-sql.repository';

@ValidatorConstraint({ name: 'BlogIdIsExist', async: true })
@Injectable()
export class BlogIdIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}
  async validate(value: string) {
    const blogIsExist = await this.blogsSqlRepository.findById(value);
    return !!blogIsExist;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `BlogId ${validationArguments?.value} not found`;
  }
}

export function BlogIdIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: BlogIdIsExistConstraint,
    });
  };
}
