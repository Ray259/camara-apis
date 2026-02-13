import { ApiProperty } from '@nestjs/swagger';
import { ScoringType } from '../types/customer-insights.types';

export class ScoringResponseDto {
  @ApiProperty({
    enum: ['gaugeMetric', 'veritasIndex'],
    description: 'Scoring measurement system.',
  })
  scoringType: ScoringType;

  @ApiProperty({
    description:
      'Result of the Scoring analysis expressed in the measure indicated in the scoringType field.',
  })
  scoringValue: number;
}
