import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches, IsEnum, IsString } from 'class-validator';
import { PHONE_REGEX } from '@/shared/utils/phone-format.util';
import { ScoringType } from '../types/customer-insights.types';

export class ScoringRequestDto {
  @ApiPropertyOptional({
    description:
      'Identification number associated to the official identity document in the country.',
  })
  @IsOptional()
  @IsString()
  idDocument?: string;

  @ApiPropertyOptional({
    pattern: '^\\+[1-9][0-9]{4,14}$',
    example: '+556253423432',
    description: 'Phone number in E.164 format.',
  })
  @IsOptional()
  @Matches(PHONE_REGEX)
  phoneNumber?: string;

  @ApiPropertyOptional({
    enum: ['gaugeMetric', 'veritasIndex'],
    description: 'Scoring type/scale to use for the response.',
  })
  @IsOptional()
  @IsEnum(['gaugeMetric', 'veritasIndex'])
  scoringType?: ScoringType;
}
