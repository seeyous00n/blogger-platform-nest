import * as bcrypt from 'bcrypt';

export const generatePasswordHash = async (
  password: string,
): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const compareHash = async (password: string, hash: string) =>
  await bcrypt.compare(password, hash);
