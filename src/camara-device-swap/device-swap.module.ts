import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { DeviceSwapController } from './controllers/device-swap.controller';
import { DeviceSwapService } from './services/device-swap.service';
import {
  InMemoryDeviceSwapRepository,
  DEVICE_SWAP_REPOSITORY,
} from './repositories/device-swap.repository';
import { XCorrelatorMiddleware } from '@/shared/middlewares/x-correlator.middleware';

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
export class DeviceSwapModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(XCorrelatorMiddleware).forRoutes('*');
  }
}
