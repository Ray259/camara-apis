import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';
import { PHONE_REGEX } from '@/shared/utils/phone-validation.util';

export class CreateCallForwardingSignalDto {
  @ApiPropertyOptional({
    pattern: '^\\+[1-9][0-9]{4,14}$',
    example: '+123456789',
  })
  @IsOptional()
  @Matches(PHONE_REGEX)
  phoneNumber?: string;
}
