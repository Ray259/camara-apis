import { Injectable, Inject, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(NumberVerificationService.name);

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
      this.logger.warn('resolveNetworkPhone: tokenSub is missing — rejecting request');
      throw new ApiException(
        403,
        ErrorCode[
          'NUMBER_VERIFICATION.USER_NOT_AUTHENTICATED_BY_MOBILE_NETWORK'
        ],
        'Client must authenticate via the mobile network to use this service',
      );
    }
    this.logger.debug(`resolveNetworkPhone: resolving network phone for sub="${tokenSub}"`);
    const phone = await this.repository.getNetworkPhoneNumber(tokenSub);
    this.logger.debug('resolveNetworkPhone: network phone resolved successfully');
    return phone;
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
    this.logger.log(`verifyPhoneNumber: incoming request — phoneNumber=${!!dto.phoneNumber}, hashedPhoneNumber=${!!dto.hashedPhoneNumber}`);
    const input = dto.phoneNumber ?? dto.hashedPhoneNumber;

    if (!input) {
      this.logger.warn('verifyPhoneNumber: neither phoneNumber nor hashedPhoneNumber provided');
      // demo err
      throw new ApiException(
        400,
        ErrorCode.INVALID_ARGUMENT,
        'Exactly one of phoneNumber or hashedPhoneNumber must be provided.',
      );
    }

    if (dto.phoneNumber && dto.hashedPhoneNumber) {
      this.logger.warn('verifyPhoneNumber: both phoneNumber and hashedPhoneNumber provided simultaneously');
      // demo err
      throw new ApiException(
        400,
        ErrorCode.INVALID_ARGUMENT,
        'Only one of phoneNumber or hashedPhoneNumber may be provided, not both.',
      );
    }

    const inputType = dto.phoneNumber ? 'plain' : 'hashed';
    this.logger.log(`verifyPhoneNumber: comparing ${inputType} phone number against network identity`);
    const networkPhone = await this.resolveNetworkPhone(tokenSub);
    const match = matchPhoneNumber(networkPhone, input);
    this.logger.log(`verifyPhoneNumber: result=${match}`);
    return match;
  }

  /**
   * GET /device-phone-number
   *
   * Returns the E.164 phone number the network operator associates with the
   * end-user's SIM for the current access token.
   */
  async getDevicePhoneNumber(tokenSub: string | undefined): Promise<string> {
    this.logger.log('getDevicePhoneNumber: incoming request');
    const phone = await this.resolveNetworkPhone(tokenSub);
    this.logger.log('getDevicePhoneNumber: phone number retrieved successfully');
    return phone;
  }
}
