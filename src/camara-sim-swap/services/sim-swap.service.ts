import { Injectable, Inject } from '@nestjs/common';
import { ApiException } from '@/shared/exceptions/api-exception';
import { ErrorCode } from '@/shared/exceptions/error-code.enum';
import { validatePhone } from '@/shared/utils/phone-validation.util';
import {
  ISimSwapRepository,
  SIM_SWAP_REPOSITORY,
} from '../repositories/sim-swap.repository';
import { SimSwapInfo } from '../types/sim-swap.types';

@Injectable()
export class SimSwapService {
  constructor(
    @Inject(SIM_SWAP_REPOSITORY)
    private readonly repository: ISimSwapRepository,
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

  async retrieveDate(
    phoneIdentifier: string | undefined,
    bodyPhoneNumber: string | undefined,
  ): Promise<SimSwapInfo> {
    const phoneNumber = this.resolvePhoneNumber(phoneIdentifier, bodyPhoneNumber);

    validatePhone(phoneNumber);

    return this.repository.getLatestSimSwap(phoneNumber);
  }
}
