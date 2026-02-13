import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CallForwardingSignalModule } from './camara-call-forwarding-signal/call-forwarding-signal.module';
import { CustomerInsightsModule } from './camara-customer-insights/customer-insights.module';
import { DeviceSwapModule } from './camara-device-swap/device-swap.module';
import { SimSwapModule } from './camara-sim-swap/sim-swap.module';
import { NumberVerificationModule } from './camara-number-verification/number-verification.module';
import { AuthModule } from './auth/auth.module';
import { NefModule } from './nef/nef.module';
import { HealthController } from './health/health.controller';
import { XCorrelatorMiddleware } from '@/shared/middlewares/x-correlator.middleware';

@Module({
  imports: [
    AuthModule,
    NefModule,
    CallForwardingSignalModule,
    CustomerInsightsModule,
    DeviceSwapModule,
    SimSwapModule,
    NumberVerificationModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(XCorrelatorMiddleware).forRoutes('*');
  }
}
