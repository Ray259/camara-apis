import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';
import { VerifyPhoneNumberDto } from '../dtos/verify-phone-number.dto';
import {
  NumberVerificationMatchResponseDto,
  NumberVerificationShareResponseDto,
} from '../dtos/number-verification-response.dto';

const xCorrelatorHeader = ApiHeader({
  name: 'x-correlator',
  description: 'Correlation id for the different services',
  required: false,
  schema: { type: 'string', pattern: '^[a-zA-Z0-9-_:;./<>{}]{0,256}$' },
});

export function PostVerifyDoc() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Verifies if the received hashed/plain text phone number matches the phone number associated with the access token',
      description: [
        'Verifies if the specified phone number (plain or hashed) matches the one currently used by the authenticated device.',
        '- Requires a **3-legged** access token — the device must authenticate via the mobile network.',
        '- Returns `true`/`false` only; the actual phone number is **not** returned.',
      ].join('\n'),
      operationId: 'phoneNumberVerify',
    }),
    xCorrelatorHeader,
    ApiBody({
      type: VerifyPhoneNumberDto,
      examples: {
        'Plain E.164 phone number': {
          summary: 'Verify using plain text phone number',
          value: { phoneNumber: '+123456789' },
        },
        'Hashed phone number (SHA-256)': {
          summary: 'Verify using SHA-256 hash of the E.164 number',
          value: {
            hashedPhoneNumber:
              '32f67ab4e4312618b09cd23ed8ce41b13e095fe52b73b2e8da8ef49830e50dba',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'OK — verification result',
      type: NumberVerificationMatchResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'INVALID_ARGUMENT — missing or conflicting body fields',
    }),
    ApiResponse({ status: 401, description: 'UNAUTHENTICATED' }),
    ApiResponse({
      status: 403,
      description:
        'PERMISSION_DENIED | NUMBER_VERIFICATION.USER_NOT_AUTHENTICATED_BY_MOBILE_NETWORK',
    }),
  );
}

export function GetDevicePhoneNumberDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Returns the phone number associated with the access token',
      description: [
        "Returns the E.164 phone number the network operator associates with the end-user's SIM.",
        '- Requires a **3-legged** access token — the device must authenticate via the mobile network.',
      ].join('\n'),
      operationId: 'phoneNumberShare',
    }),
    xCorrelatorHeader,
    ApiResponse({
      status: 200,
      description: 'OK — device phone number',
      type: NumberVerificationShareResponseDto,
    }),
    ApiResponse({ status: 400, description: 'INVALID_ARGUMENT' }),
    ApiResponse({ status: 401, description: 'UNAUTHENTICATED' }),
    ApiResponse({
      status: 403,
      description:
        'PERMISSION_DENIED | NUMBER_VERIFICATION.USER_NOT_AUTHENTICATED_BY_MOBILE_NETWORK',
    }),
  );
}
