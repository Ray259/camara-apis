import { Module } from '@nestjs/common';
import { SimSwapController } from './controllers/sim-swap.controller';
import { SimSwapService } from './services/sim-swap.service';
import {
  VodafoneSimSwapRepository,
  SIM_SWAP_REPOSITORY,
} from './repositories/sim-swap.repository';

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
export class SimSwapModule {}
