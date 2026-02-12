import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ApiException } from '@/shared/exceptions/api-exception';
import { ErrorCode } from '@/shared/exceptions/error-code.enum';
import { IssueTokenDto, TokenResponseDto } from '../dtos/issue-token.dto';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

/**
 * Issues signed JWT tokens for local development and testing.
 *
 * This service mimics the token issuance behaviour of a real CAMARA-compliant
 * OIDC/OAuth2 authorisation server:
 *
 * - **3-legged token** (device-bound): when a `phoneNumber` is supplied the token's
 *   `sub` claim is set to `tel:<phoneNumber>`.  This satisfies the `JwtAuthGuard`
 *   and the Number Verification service's mobile-network check.
 * - **2-legged token** (server-to-server): when `phoneNumber` is omitted the `sub`
 *   is `server-client`.  Suitable for APIs that accept identity in the body.
 *
 * The token is signed with the same `JWT_SECRET` env var used by `JwtAuthGuard`.
 */
@Injectable()
export class AuthService {
  issueToken(dto: IssueTokenDto): TokenResponseDto {
    const { phoneNumber, sub: customSub, expiresIn = 3600 } = dto;

    if (phoneNumber && customSub) {
      // demo err
      throw new ApiException(
        400,
        ErrorCode.INVALID_ARGUMENT,
        'Provide either phoneNumber or sub, not both.',
      );
    }

    const sub =
      customSub ?? (phoneNumber ? `tel:${phoneNumber}` : 'server-client');
    const now = Math.floor(Date.now() / 1000);

    const payload: jwt.JwtPayload = {
      sub,
      iat: now,
      exp: now + expiresIn,
      // CAMARA-aligned scopes for the most commonly used APIs
      scope: [
        'number-verification:verify',
        'number-verification:device-phone-number:read',
        'call-forwarding-signal:read',
      ].join(' '),
    };

    const access_token = jwt.sign(payload, JWT_SECRET);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: expiresIn,
      sub,
    };
  }
}
