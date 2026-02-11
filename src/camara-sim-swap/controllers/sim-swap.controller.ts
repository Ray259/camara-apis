import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SimSwapService } from '../services/sim-swap.service';
import { CreateSimSwapDateDto } from '../dtos/create-sim-swap-date.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { PhoneIdentifierGuard } from '@/shared/guards/phone-identifier.guard';
import { AuthenticatedRequest } from '@/shared/types/request.types';
import { SimSwapInfo } from '../types/sim-swap.types';
import { PostRetrieveDateDoc } from '../docs/docs';

@ApiTags('SIM Swap')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PhoneIdentifierGuard)
@Controller('sim-swap/vwip')
export class SimSwapController {
  constructor(private readonly simSwapService: SimSwapService) {}

  @Post('retrieve-date')
  @HttpCode(200)
  @PostRetrieveDateDoc()
  async retrieveDate(
    @Body() dto: CreateSimSwapDateDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<SimSwapInfo> {
    return this.simSwapService.retrieveDate(
      req.phoneIdentifier,
      dto.phoneNumber,
    );
  }
}
