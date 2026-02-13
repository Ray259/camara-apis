import { Module } from '@nestjs/common';
import { CallForwardingSignalController } from './controllers/call-forwarding-signal.controller';
import { CallForwardingSignalService } from './services/call-forwarding-signal.service';
import {
  InMemoryCallForwardingRepository,
  CALL_FORWARDING_REPOSITORY,
} from './repositories/call-forwarding.repository';

@Module({
  controllers: [CallForwardingSignalController],
  providers: [
    CallForwardingSignalService,
    {
      provide: CALL_FORWARDING_REPOSITORY,
      useClass: InMemoryCallForwardingRepository,
    },
  ],
})
export class CallForwardingSignalModule {}
