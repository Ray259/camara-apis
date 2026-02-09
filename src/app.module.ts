import { Module } from '@nestjs/common';
import { CallForwardingSignalModule } from './camara-call-forwarding-signal/call-forwarding-signal.module';
import { CustomerInsightsModule } from './camara-customer-insights/customer-insights.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [CallForwardingSignalModule, CustomerInsightsModule],
  controllers: [HealthController],
})
export class AppModule {}

