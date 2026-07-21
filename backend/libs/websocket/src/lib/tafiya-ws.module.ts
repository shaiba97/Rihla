import { Global, Module } from '@nestjs/common';
import { TafiyaWsGateway } from './tafiya-ws.gateway';

@Global()
@Module({
  providers: [TafiyaWsGateway],
  exports: [TafiyaWsGateway],
})
export class TafiyaWsModule {}
