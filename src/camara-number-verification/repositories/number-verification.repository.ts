import { Injectable } from '@nestjs/common';

export const NUMBER_VERIFICATION_REPOSITORY = 'NUMBER_VERIFICATION_REPOSITORY';

export interface INumberVerificationRepository {
  getNetworkPhoneNumber(tokenSub: string): Promise<string>;
}

@Injectable()
export class NumberVerificationRepository implements INumberVerificationRepository {
  async getNetworkPhoneNumber(tokenSub: string): Promise<string> {
    if (!tokenSub.startsWith('tel:')) {
      throw new Error(`Unsupported token sub format: ${tokenSub}`); // demo err
    }
    return tokenSub.slice(4);
  }
}
