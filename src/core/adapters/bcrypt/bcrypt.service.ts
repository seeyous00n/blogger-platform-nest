import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoService {
  async generatePasswordHash(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async compareHash(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
