import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SimSwapController } from './controllers/sim-swap.controller';
import { SimSwapService } from './services/sim-swap.service';
import {
  VodafoneSimSwapRepository,
  SIM_SWAP_REPOSITORY,
} from './repositories/sim-swap.repository';
import { XCorrelatorMiddleware } from '@/shared/middlewares/x-correlator.middleware';

@Module({
  controllers: [SimSwapController],
  providers: [
    SimSwapService,
    {
      provide: SIM_SWAP_REPOSITORY,
      useClass: VodafoneSimSwapRepository,
    },
  ],
})
export class SimSwapModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(XCorrelatorMiddleware).forRoutes('*');
  }
}
