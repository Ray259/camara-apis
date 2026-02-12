import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

/**
 * AuthModule — issues signed JWT tokens for local development and testing.
 *
 * **Not for production use.** In production, token issuance is handled by the
 * operator's OIDC/OAuth2 authorisation server (Authorization Code Flow / CIBA).
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
