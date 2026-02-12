import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { IssueTokenDto, TokenResponseDto } from '../dtos/issue-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/token
   *
   * Issues a mock JWT access token for development and testing.
   *
   * In production, tokens are issued by the operator's OIDC/OAuth2 server via
   * Authorization Code Flow or CIBA (for 3-legged flows).
   *
   * Supply a `phoneNumber` to receive a 3-legged token whose `sub` is `tel:<phoneNumber>`.
   * Omit it to receive a 2-legged token (no device phone number in sub).
   */
  @Post('token')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Issue a mock JWT access token',
    description: [
      'Issues a signed JWT for use with the CAMARA APIs in local development and testing.',
      '',
      "**3-legged (device-bound) token**: supply `phoneNumber`. The token's `sub` claim will be `tel:<phoneNumber>`, satisfying the Number Verification mobile-network authentication requirement.",
      '',
      '**2-legged (server-to-server) token**: omit `phoneNumber`. Suitable for APIs that allow identity in the request body.',
    ].join('\n'),
    operationId: 'issueToken',
  })
  @ApiBody({
    type: IssueTokenDto,
    examples: {
      '3-legged (NV-compatible)': {
        summary: 'Device-bound token — sub will be tel:<phoneNumber>',
        value: { phoneNumber: '+123456789' },
      },
      '2-legged (server-to-server)': {
        summary: 'No device identity — sub will be "server-client"',
        value: {},
      },
      'Custom sub': {
        summary: 'Set the sub claim directly',
        value: { sub: 'tel:+123456789', expiresIn: 7200 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'JWT access token issued',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 400, description: 'INVALID_ARGUMENT' })
  issueToken(@Body() dto: IssueTokenDto): TokenResponseDto {
    return this.authService.issueToken(dto);
  }
}
