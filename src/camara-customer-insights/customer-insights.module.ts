import { Module } from '@nestjs/common';
import { CustomerInsightsController } from './controllers/customer-insights.controller';
import { CustomerInsightsService } from './services/customer-insights.service';
import {
  InMemoryCustomerInsightsRepository,
  CUSTOMER_INSIGHTS_REPOSITORY,
} from './repositories/customer-insights.repository';

@Module({
  controllers: [CustomerInsightsController],
  providers: [
    CustomerInsightsService,
    {
      provide: CUSTOMER_INSIGHTS_REPOSITORY,
      useClass: InMemoryCustomerInsightsRepository,
    },
  ],
})
export class CustomerInsightsModule {}
