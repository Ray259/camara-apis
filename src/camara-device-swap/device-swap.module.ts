import { Module } from '@nestjs/common';
import { DeviceSwapController } from './controllers/device-swap.controller';
import { DeviceSwapService } from './services/device-swap.service';
import {
  InMemoryDeviceSwapRepository,
  DEVICE_SWAP_REPOSITORY,
} from './repositories/device-swap.repository';

@Module({
  controllers: [DeviceSwapController],
  providers: [
    DeviceSwapService,
    {
      provide: DEVICE_SWAP_REPOSITORY,
      useClass: InMemoryDeviceSwapRepository,
    },
  ],
})
export class DeviceSwapModule {}
