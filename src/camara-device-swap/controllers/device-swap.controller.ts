import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DeviceSwapService } from '../services/device-swap.service';
import { CreateDeviceSwapDateDto } from '../dtos/create-device-swap-date.dto';
import { CreateCheckDeviceSwapDto } from '../dtos/create-check-device-swap.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { PhoneIdentifierGuard } from '@/shared/guards/phone-identifier.guard';
import { AuthenticatedRequest } from '@/shared/types/request.types';
import { DeviceSwapInfo, CheckDeviceSwapInfo } from '../types/device-swap.types';
import { PostRetrieveDateDoc, PostCheckDoc } from '../docs/docs';

@ApiTags('Device Swap')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PhoneIdentifierGuard)
@Controller('device-swap/vwip')
export class DeviceSwapController {
  constructor(private readonly deviceSwapService: DeviceSwapService) {}

  @Post('retrieve-date')
  @HttpCode(200)
  @PostRetrieveDateDoc()
  async retrieveDate(
    @Body() dto: CreateDeviceSwapDateDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<DeviceSwapInfo> {
    return this.deviceSwapService.retrieveDate(
      req.phoneIdentifier,
      dto.phoneNumber,
    );
  }

  @Post('check')
  @HttpCode(200)
  @PostCheckDoc()
  async check(
    @Body() dto: CreateCheckDeviceSwapDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CheckDeviceSwapInfo> {
    return this.deviceSwapService.check(
      req.phoneIdentifier,
      dto.phoneNumber,
      dto.maxAge,
    );
  }
}
