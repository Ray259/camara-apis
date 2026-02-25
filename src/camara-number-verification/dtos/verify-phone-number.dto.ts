import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches, ValidateIf } from 'class-validator';
import { PHONE_REGEX } from '@/shared/utils/phone-format.util';

const PHONE_HASH_REGEX = /^[a-fA-F0-9]{64}$/;

/**
 * Request body for `POST /number-verification/verify`.
 *
 * Exactly **one** property must be provided:
 * - `phoneNumber`       – plain E.164 format
 * - `hashedPhoneNumber` – SHA-256 of the E.164 number (64 hex chars)
 */
export class VerifyPhoneNumberDto {
  @ApiPropertyOptional({
    description:
      'Plain-text E.164 phone number. Mutually exclusive with hashedPhoneNumber.',
    pattern: '^\\+[1-9][0-9]{4,14}$',
    example: '+123456789',
  })
  @IsOptional()
  @ValidateIf((o) => !o.hashedPhoneNumber)
  @Matches(PHONE_REGEX, {
    message: 'phoneNumber must be a valid E.164 number (e.g. +123456789)',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description:
      'SHA-256 (hex) of the E.164 phone number. Mutually exclusive with phoneNumber.',
    pattern: '^[a-fA-F0-9]{64}$',
    example: '32f67ab4e4312618b09cd23ed8ce41b13e095fe52b73b2e8da8ef49830e50dba',
  })
  @IsOptional()
  @ValidateIf((o) => !o.phoneNumber)
  @Matches(PHONE_HASH_REGEX, {
    message: 'hashedPhoneNumber must be a 64-char hex string (SHA-256)',
  })
  hashedPhoneNumber?: string;
}
