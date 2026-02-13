import { Injectable } from '@nestjs/common';
import {
  CallForwardingRecord,
  CallForwardingStatus,
} from '../types/call-forwarding.types';

export interface ICallForwardingRepository {
  getUnconditionalStatus(phoneNumber: string): Promise<boolean>;
  getCallForwardingStatuses(
    phoneNumber: string,
  ): Promise<CallForwardingStatus[]>;
  phoneNumberExists(phoneNumber: string): Promise<boolean>;
}

export const CALL_FORWARDING_REPOSITORY = 'CALL_FORWARDING_REPOSITORY';

@Injectable()
export class InMemoryCallForwardingRepository implements ICallForwardingRepository {
  private records: CallForwardingRecord[] = [
    {
      phoneNumber: '+123456789',
      unconditionalActive: true,
      conditionalStatuses: ['unconditional'],
    },
    {
      phoneNumber: '+198765432',
      unconditionalActive: false,
      conditionalStatuses: ['conditional_busy', 'conditional_no_answer'],
    },
    {
      phoneNumber: '+111111111',
      unconditionalActive: false,
      conditionalStatuses: ['inactive'],
    },
    {
      phoneNumber: '+222222222',
      unconditionalActive: true,
      conditionalStatuses: [
        'unconditional',
        'conditional_busy',
        'conditional_not_reachable',
      ],
    },
  ];

  setRecords(records: CallForwardingRecord[]): void {
    this.records = records;
  }

  async phoneNumberExists(phoneNumber: string): Promise<boolean> {
    return this.records.some((r) => r.phoneNumber === phoneNumber);
  }

  async getUnconditionalStatus(phoneNumber: string): Promise<boolean> {
    const record = this.records.find((r) => r.phoneNumber === phoneNumber);
    return record?.unconditionalActive ?? false;
  }

  async getCallForwardingStatuses(
    phoneNumber: string,
  ): Promise<CallForwardingStatus[]> {
    const record = this.records.find((r) => r.phoneNumber === phoneNumber);
    return record?.conditionalStatuses ?? ['inactive'];
  }
}
