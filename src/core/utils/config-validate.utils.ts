import { validateSync } from 'class-validator';

export const configValidateUtils = {
  validate: (config: any) => {
    const errors = validateSync(config);
    if (errors.length > 0) {
      const sortMessages = errors
        .map((error) => Object.values(error.constraints || {}).join(', '))
        .join(';\r\n');
      throw new Error('validation: ' + sortMessages);
    }
  },
};
