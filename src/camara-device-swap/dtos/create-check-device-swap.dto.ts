import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches, IsInt, Min, Max } from 'class-validator';
import { PHONE_REGEX } from '@/shared/utils/phone-format.util';

export class CreateCheckDeviceSwapDto {
  @ApiPropertyOptional({
    pattern: '^\\+[1-9][0-9]{4,14}$',
    example: '+34666111333',
  })
  @IsOptional()
  @Matches(PHONE_REGEX)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Period in hours to be checked for device swap.',
    example: 240,
    minimum: 1,
    maximum: 2400,
    default: 240,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2400)
  maxAge?: number;
}
