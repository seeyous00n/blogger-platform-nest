import { Module } from '@nestjs/common';
import { CryptoService } from './bcrypt.service';

@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoServiceModule {}
