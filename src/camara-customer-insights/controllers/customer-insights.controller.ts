import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerInsightsService } from '../services/customer-insights.service';
import { ScoringRequestDto } from '../dtos/scoring-request.dto';
import { ScoringResponseDto } from '../dtos/scoring-response.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { PhoneIdentifierGuard } from '@/shared/guards/phone-identifier.guard';
import { AuthenticatedRequest } from '@/shared/types/request.types';
import { RetrieveScoringDoc } from '../docs/docs';

@ApiTags('Scoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PhoneIdentifierGuard)
@Controller('customer-insights/vwip')
export class CustomerInsightsController {
  constructor(private readonly customerInsightsService: CustomerInsightsService) {}

  @Post('scoring/retrieve')
  @HttpCode(200)
  @RetrieveScoringDoc()
  async retrieveScoring(
    @Body() dto: ScoringRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ScoringResponseDto> {
    return this.customerInsightsService.retrieveScoring(
      req.phoneIdentifier,
      dto.phoneNumber,
      dto.idDocument,
      dto.scoringType,
    );
  }
}
