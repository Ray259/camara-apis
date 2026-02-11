import { Module } from '@nestjs/common';
import { CallForwardingSignalModule } from './camara-call-forwarding-signal/call-forwarding-signal.module';
import { CustomerInsightsModule } from './camara-customer-insights/customer-insights.module';
import { DeviceSwapModule } from './camara-device-swap/device-swap.module';
import { SimSwapModule } from './camara-sim-swap/sim-swap.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [CallForwardingSignalModule, CustomerInsightsModule, DeviceSwapModule, SimSwapModule],
  controllers: [HealthController],
})
export class AppModule {}

