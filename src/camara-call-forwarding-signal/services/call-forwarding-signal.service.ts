import { Injectable, Inject } from '@nestjs/common';
import { ApiException } from '@/shared/exceptions/api-exception';
import { ErrorCode } from '@/shared/exceptions/error-code.enum';
import { validatePhone } from '@/shared/utils/phone-validation.util';
import {
  ICallForwardingRepository,
  CALL_FORWARDING_REPOSITORY,
} from '../repositories/call-forwarding.repository';
import { CallForwardingStatus } from '../types/call-forwarding.types';

@Injectable()
export class CallForwardingSignalService {
  constructor(
    @Inject(CALL_FORWARDING_REPOSITORY)
    private readonly repository: ICallForwardingRepository,
  ) {}

  private async ensurePhoneExists(phoneNumber: string): Promise<void> {
    const exists = await this.repository.phoneNumberExists(phoneNumber);
    if (!exists) {
      throw new ApiException(
        404,
        ErrorCode.IDENTIFIER_NOT_FOUND,
        'Device identifier not found.',
      );
    }
  }

  async checkUnconditionalForwarding(
    phoneIdentifier: string | undefined,
    bodyPhoneNumber: string | undefined,
  ): Promise<boolean> {
    const phoneNumber = phoneIdentifier || bodyPhoneNumber;
    if (!phoneNumber) {
      throw new ApiException(
        422,
        ErrorCode.MISSING_IDENTIFIER,
        'The phone number cannot be identified.',
      );
    }

    validatePhone(phoneNumber);
    await this.ensurePhoneExists(phoneNumber);

    return this.repository.getUnconditionalStatus(phoneNumber);
  }

  async checkCallForwardings(
    phoneIdentifier: string | undefined,
    bodyPhoneNumber: string | undefined,
  ): Promise<CallForwardingStatus[]> {
    const phoneNumber = phoneIdentifier || bodyPhoneNumber;
    if (!phoneNumber) {
      throw new ApiException(
        422,
        ErrorCode.MISSING_IDENTIFIER,
        'The phone number cannot be identified.',
      );
    }

    validatePhone(phoneNumber);
    await this.ensurePhoneExists(phoneNumber);

    return this.repository.getCallForwardingStatuses(phoneNumber);
  }
}
