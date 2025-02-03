export const transformToSnakeCase = (word: string): string => {
  return word.split('').reduce((accum: string, currentValue: string) => {
    if (currentValue === currentValue.toUpperCase()) {
      return accum + `_${currentValue.toLowerCase()}`;
    }
    return accum + currentValue;
  }, '');
};
