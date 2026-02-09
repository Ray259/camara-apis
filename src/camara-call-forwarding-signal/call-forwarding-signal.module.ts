import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CallForwardingSignalController } from './controllers/call-forwarding-signal.controller';
import { CallForwardingSignalService } from './services/call-forwarding-signal.service';
import {
  InMemoryCallForwardingRepository,
  CALL_FORWARDING_REPOSITORY,
} from './repositories/call-forwarding.repository';
import { XCorrelatorMiddleware } from '@/shared/middlewares/x-correlator.middleware';

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
export class CallForwardingSignalModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(XCorrelatorMiddleware).forRoutes('*');
  }
}
