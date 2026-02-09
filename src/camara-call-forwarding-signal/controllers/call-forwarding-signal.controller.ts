import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CallForwardingSignalService } from '../services/call-forwarding-signal.service';
import { CreateCallForwardingSignalDto } from '../dtos/create-call-forwarding.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { PhoneIdentifierGuard } from '@/shared/guards/phone-identifier.guard';
import { AuthenticatedRequest } from '@/shared/types/request.types';
import {
  CallForwardingStatus,
  UnconditionalCallForwardingResponse,
} from '../types/call-forwarding.types';
import { PostUnconditionalCallForwardingsDoc } from '../docs/unconditional-call-forwardings.doc';
import { PostCallForwardingsDoc } from '../docs/call-forwardings.doc';

@ApiTags('Call Forwarding Signal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PhoneIdentifierGuard)
@Controller('call-forwarding-signal/vwip')
export class CallForwardingSignalController {
  constructor(private readonly callForwardingSignalService: CallForwardingSignalService) {}

  @Post('unconditional-call-forwardings')
  @HttpCode(200)
  @PostUnconditionalCallForwardingsDoc()
  async checkUnconditionalCallForwarding(
    @Body() dto: CreateCallForwardingSignalDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<UnconditionalCallForwardingResponse> {
    const active = await this.callForwardingSignalService.checkUnconditionalForwarding(
      req.phoneIdentifier,
      dto.phoneNumber,
    );
    return { active };
  }

  @Post('call-forwardings')
  @HttpCode(200)
  @PostCallForwardingsDoc()
  async checkCallForwardings(
    @Body() dto: CreateCallForwardingSignalDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CallForwardingStatus[]> {
    return this.callForwardingSignalService.checkCallForwardings(
      req.phoneIdentifier,
      dto.phoneNumber,
    );
  }
}
