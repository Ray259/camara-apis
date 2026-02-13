export interface DeviceSwapInfo {
  latestDeviceChange: string | null;
  monitoredPeriod?: number;
}

export interface CheckDeviceSwapInfo {
  swapped: boolean;
}

export interface DeviceSwapRecord {
  phoneNumber: string;
  latestDeviceChange: string | null;
  monitoredPeriod?: number;
  serviceApplicable: boolean;
}
