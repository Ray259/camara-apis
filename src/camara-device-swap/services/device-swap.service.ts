import { Injectable, Inject } from '@nestjs/common';
import { ApiException } from '@/shared/exceptions/api-exception';
import { ErrorCode } from '@/shared/exceptions/error-code.enum';
import { validatePhone } from '@/shared/utils/phone-validation.util';
import {
  IDeviceSwapRepository,
  DEVICE_SWAP_REPOSITORY,
} from '../repositories/device-swap.repository';
import { DeviceSwapInfo, CheckDeviceSwapInfo } from '../types/device-swap.types';

const DEFAULT_MAX_AGE = 240;

@Injectable()
export class DeviceSwapService {
  constructor(
    @Inject(DEVICE_SWAP_REPOSITORY)
    private readonly repository: IDeviceSwapRepository,
  ) {}

  private resolvePhoneNumber(
    phoneIdentifier: string | undefined,
    bodyPhoneNumber: string | undefined,
  ): string {
    const phoneNumber = phoneIdentifier || bodyPhoneNumber;
    if (!phoneNumber) {
      throw new ApiException(
        422,
        ErrorCode.MISSING_IDENTIFIER,
        'The device cannot be identified.',
      );
    }
    return phoneNumber;
  }

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

  private async ensureServiceApplicable(phoneNumber: string): Promise<void> {
    const applicable = await this.repository.isServiceApplicable(phoneNumber);
    if (!applicable) {
      throw new ApiException(
        422,
        ErrorCode.SERVICE_NOT_APPLICABLE,
        'The service is not available for the provided identifier.',
      );
    }
  }

  async retrieveDate(
    phoneIdentifier: string | undefined,
    bodyPhoneNumber: string | undefined,
  ): Promise<DeviceSwapInfo> {
    const phoneNumber = this.resolvePhoneNumber(phoneIdentifier, bodyPhoneNumber);

    validatePhone(phoneNumber);
    await this.ensurePhoneExists(phoneNumber);
    await this.ensureServiceApplicable(phoneNumber);

    return this.repository.getLatestDeviceSwap(phoneNumber);
  }

  async check(
    phoneIdentifier: string | undefined,
    bodyPhoneNumber: string | undefined,
    maxAge: number | undefined,
  ): Promise<CheckDeviceSwapInfo> {
    const phoneNumber = this.resolvePhoneNumber(phoneIdentifier, bodyPhoneNumber);

    validatePhone(phoneNumber);
    await this.ensurePhoneExists(phoneNumber);
    await this.ensureServiceApplicable(phoneNumber);

    const effectiveMaxAge = maxAge ?? DEFAULT_MAX_AGE;

    if (effectiveMaxAge < 1 || effectiveMaxAge > 2400) {
      throw new ApiException(
        400,
        ErrorCode.OUT_OF_RANGE,
        'Client specified an invalid range.',
      );
    }

    const swapInfo = await this.repository.getLatestDeviceSwap(phoneNumber);

    if (swapInfo.latestDeviceChange === null) {
      return { swapped: false };
    }

    const swapDate = new Date(swapInfo.latestDeviceChange);
    const cutoff = new Date(Date.now() - effectiveMaxAge * 60 * 60 * 1000);
    const swapped = swapDate >= cutoff;

    return { swapped };
  }
}
