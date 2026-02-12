import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';
import { PHONE_REGEX } from '@/shared/utils/phone-format.util';

/**
 * Request body for POST /auth/token
 *
 * All fields are optional. Omit `phoneNumber` for a 2-legged (server-to-server) token.
 * Supply `phoneNumber` to get a 3-legged (mobile-network) token whose `sub` is `tel:<phoneNumber>`.
 */
export class IssueTokenDto {
  @ApiPropertyOptional({
    description:
      'E.164 phone number. If supplied, the issued token is "3-legged" — its `sub` will be `tel:<phoneNumber>`, satisfying mobile-network authentication requirements.',
    pattern: '^\\+[1-9][0-9]{4,14}$',
    example: '+123456789',
  })
  @IsOptional()
  @Matches(PHONE_REGEX, {
    message: 'phoneNumber must be in E.164 format (e.g. +123456789)',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description:
      'Subject for the issued token. Defaults to `tel:<phoneNumber>` when phoneNumber is set, or `server-client` for 2-legged tokens. Use this to customise the sub directly.',
    example: 'tel:+123456789',
  })
  @IsOptional()
  sub?: string;

  @ApiPropertyOptional({
    description: 'Token lifetime in seconds. Defaults to 3600 (1 hour).',
    example: 3600,
    default: 3600,
  })
  @IsOptional()
  expiresIn?: number;
}

export class TokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5...' })
  access_token: string;

  @ApiProperty({ example: 'Bearer' })
  token_type: string;

  @ApiProperty({ example: 3600 })
  expires_in: number;

  @ApiProperty({ example: 'tel:+123456789' })
  sub: string;
}
