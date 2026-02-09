import { DocumentBuilder } from '@nestjs/swagger';

export const callForwardingSwaggerConfig = {
  path: 'api-docs/call-forwarding-signal',
  config: new DocumentBuilder()
    .setTitle('Call Forwarding Signal')
    .setDescription('The Call Forwarding Signal API provides information about call forwarding status.')
    .setVersion('wip')
    .addBearerAuth()
    .addServer('/call-forwarding-signal/vwip')
    .build(),
};

