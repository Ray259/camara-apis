import { Injectable } from '@nestjs/common';
import { DeviceSwapRecord, DeviceSwapInfo } from '../types/device-swap.types';

export interface IDeviceSwapRepository {
  phoneNumberExists(phoneNumber: string): Promise<boolean>;
  getLatestDeviceSwap(phoneNumber: string): Promise<DeviceSwapInfo>;
  isServiceApplicable(phoneNumber: string): Promise<boolean>;
}

export const DEVICE_SWAP_REPOSITORY = 'DEVICE_SWAP_REPOSITORY';

@Injectable()
export class InMemoryDeviceSwapRepository implements IDeviceSwapRepository {
  private records: DeviceSwapRecord[] = [
    {
      phoneNumber: '+123456789',
      latestDeviceChange: '2024-09-18T07:37:53.471Z',
      serviceApplicable: true,
    },
    {
      phoneNumber: '+198765432',
      latestDeviceChange: null,
      monitoredPeriod: 120,
      serviceApplicable: true,
    },
    {
      phoneNumber: '+111111111',
      latestDeviceChange: '2020-01-01T00:00:00.000Z',
      serviceApplicable: false,
    },
    {
      phoneNumber: '+222222222',
      latestDeviceChange: null,
      serviceApplicable: true,
    },
  ];

  async phoneNumberExists(phoneNumber: string): Promise<boolean> {
    return this.records.some((r) => r.phoneNumber === phoneNumber);
  }

  async getLatestDeviceSwap(phoneNumber: string): Promise<DeviceSwapInfo> {
    const record = this.records.find((r) => r.phoneNumber === phoneNumber);
    return {
      latestDeviceChange: record?.latestDeviceChange ?? null,
      ...(record?.monitoredPeriod !== undefined && {
        monitoredPeriod: record.monitoredPeriod,
      }),
    };
  }

  async isServiceApplicable(phoneNumber: string): Promise<boolean> {
    const record = this.records.find((r) => r.phoneNumber === phoneNumber);
    return record?.serviceApplicable ?? false;
  }
}
