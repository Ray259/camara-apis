import { DocumentBuilder } from '@nestjs/swagger';

export const deviceSwapSwaggerConfig = {
  path: 'api-docs/device-swap',
  config: new DocumentBuilder()
    .setTitle('Device Swap')
    .setDescription('The Device Swap API provides information about the last device swap event.')
    .setVersion('wip')
    .addBearerAuth()
    .addServer('/device-swap/vwip')
    .build(),
};
