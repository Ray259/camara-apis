import { Injectable, Inject } from '@nestjs/common';
import { ApiException } from '@/shared/exceptions/api-exception';
import { ErrorCode } from '@/shared/exceptions/error-code.enum';
import { matchPhoneNumber } from '@/shared/utils/phone-format.util';
import {
  INumberVerificationRepository,
  NUMBER_VERIFICATION_REPOSITORY,
} from '../repositories/number-verification.repository';
import { VerifyPhoneNumberDto } from '../dtos/verify-phone-number.dto';

@Injectable()
export class NumberVerificationService {
  constructor(
    @Inject(NUMBER_VERIFICATION_REPOSITORY)
    private readonly repository: INumberVerificationRepository,
  ) {}

  /**
   * Resolves the device phone number from the 3-legged token subject.
   * Throws 403 `NUMBER_VERIFICATION.USER_NOT_AUTHENTICATED_BY_MOBILE_NETWORK`
   * if the token subject does not encode a mobile-network identity.
   */
  private async resolveNetworkPhone(
    tokenSub: string | undefined,
  ): Promise<string> {
    if (!tokenSub) {
      throw new ApiException(
        403,
        ErrorCode[
          'NUMBER_VERIFICATION.USER_NOT_AUTHENTICATED_BY_MOBILE_NETWORK'
        ],
        'Client must authenticate via the mobile network to use this service',
      );
    }
    return this.repository.getNetworkPhoneNumber(tokenSub);
  }

  /**
   * POST /verify
   *
   * Compares the caller-supplied phone number (plain or SHA-256 hashed)
   * against the network-confirmed phone number of the authenticated device.
   */
  async verifyPhoneNumber(
    tokenSub: string | undefined,
    dto: VerifyPhoneNumberDto,
  ): Promise<boolean> {
    const input = dto.phoneNumber ?? dto.hashedPhoneNumber;

    if (!input) {
      // demo err
      throw new ApiException(
        400,
        ErrorCode.INVALID_ARGUMENT,
        'Exactly one of phoneNumber or hashedPhoneNumber must be provided.',
      );
    }

    if (dto.phoneNumber && dto.hashedPhoneNumber) {
      // demo err
      throw new ApiException(
        400,
        ErrorCode.INVALID_ARGUMENT,
        'Only one of phoneNumber or hashedPhoneNumber may be provided, not both.',
      );
    }

    const networkPhone = await this.resolveNetworkPhone(tokenSub);
    return matchPhoneNumber(networkPhone, input);
  }

  /**
   * GET /device-phone-number
   *
   * Returns the E.164 phone number the network operator associates with the
   * end-user's SIM for the current access token.
   */
  async getDevicePhoneNumber(tokenSub: string | undefined): Promise<string> {
    return this.resolveNetworkPhone(tokenSub);
  }
}
