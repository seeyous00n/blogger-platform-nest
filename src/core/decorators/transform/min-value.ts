import { Transform, TransformFnParams } from 'class-transformer';

export const MinAndDefaultValue = (minValue: number, defaultValue: number) =>
  Transform(({ value }: TransformFnParams) =>
    isNaN(value) ? defaultValue : value < minValue ? defaultValue : value,
  );
