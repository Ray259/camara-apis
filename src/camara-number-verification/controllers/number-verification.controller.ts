import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NumberVerificationService } from '../services/number-verification.service';
import { VerifyPhoneNumberDto } from '../dtos/verify-phone-number.dto';
import {
  NumberVerificationMatchResponseDto,
  NumberVerificationShareResponseDto,
} from '../dtos/number-verification-response.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { PhoneIdentifierGuard } from '@/shared/guards/phone-identifier.guard';
import { AuthenticatedRequest } from '@/shared/types/request.types';
import { PostVerifyDoc, GetDevicePhoneNumberDoc } from '../docs/docs';

@ApiTags('Number Verification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('number-verification/vwip')
export class NumberVerificationController {
  private readonly logger = new Logger(NumberVerificationController.name);

  constructor(
    private readonly numberVerificationService: NumberVerificationService,
  ) {}

  @Post('verify')
  @HttpCode(200)
  @PostVerifyDoc()
  async verify(
    @Body() dto: VerifyPhoneNumberDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<NumberVerificationMatchResponseDto> {
    this.logger.log(`POST /verify — sub="${req.jwtPayload?.sub}"`);
    // PhoneIdentifierGuard not used here — body phoneNumber is the comparison
    // target, not a user identifier. Token sub is extracted directly.
    const devicePhoneNumberVerified =
      await this.numberVerificationService.verifyPhoneNumber(
        req.jwtPayload?.sub,
        dto,
      );
    this.logger.log(`POST /verify — result=${devicePhoneNumberVerified}`);
    return { devicePhoneNumberVerified };
  }

  @Get('device-phone-number')
  @UseGuards(PhoneIdentifierGuard)
  @GetDevicePhoneNumberDoc()
  async getDevicePhoneNumber(
    @Req() req: AuthenticatedRequest,
  ): Promise<NumberVerificationShareResponseDto> {
    this.logger.log(`GET /device-phone-number — phoneIdentifier="${req.phoneIdentifier}"`);
    const devicePhoneNumber =
      await this.numberVerificationService.getDevicePhoneNumber(
        req.phoneIdentifier,
      );
    this.logger.log('GET /device-phone-number — phone number returned successfully');
    return { devicePhoneNumber };
  }
}
