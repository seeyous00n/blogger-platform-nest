import { Global, Module } from '@nestjs/common';
import { CoreConfig } from './core.config';
import { CqrsModule } from '@nestjs/cqrs';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [CoreConfig],
  exports: [CoreConfig, CqrsModule],
})
export class CoreModule {}
