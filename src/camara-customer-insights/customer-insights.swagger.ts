import { DocumentBuilder } from '@nestjs/swagger';

export const customerInsightsSwaggerConfig = {
  path: 'api-docs/customer-insights',
  config: new DocumentBuilder()
    .setTitle('Customer Insights')
    .setDescription('Allows the API consumer to retrieve a risk index based on the individual profile owned by a Telco Operator.')
    .setVersion('wip')
    .addBearerAuth()
    .addServer('/customer-insights/vwip')
    .build(),
};

