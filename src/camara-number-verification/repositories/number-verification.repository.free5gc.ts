import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { INumberVerificationRepository } from './number-verification.repository';
import { ApiException } from '@/shared/exceptions/api-exception';
import { ErrorCode } from '@/shared/exceptions/error-code.enum';
import { toNefGpsi } from '@/shared/utils/phone-format.util';

@Injectable()
export class Free5GCNumberVerificationRepository
  implements INumberVerificationRepository, OnModuleDestroy
{
  private readonly logger = new Logger(
    Free5GCNumberVerificationRepository.name,
  );
  private client: MongoClient | null = null;
  private db: Db | null = null;

  constructor(private readonly mongoUri: string) {}

  private async getDb(): Promise<Db> {
    if (!this.db) {
      this.client = new MongoClient(this.mongoUri);
      await this.client.connect();
      this.db = this.client.db('free5gc');
      this.logger.log(`Connected to free5gc MongoDB`);
    }
    return this.db;
  }

  async getNetworkPhoneNumber(tokenSub: string): Promise<string> {
    if (!tokenSub.startsWith('tel:')) {
      throw new ApiException(
        403,
        ErrorCode[
          'NUMBER_VERIFICATION.USER_NOT_AUTHENTICATED_BY_MOBILE_NETWORK'
        ],
        'Client must authenticate via the mobile network to use this service',
      );
    }

    const e164 = tokenSub.slice(4); // e.g. +123456789
    const gpsi = toNefGpsi(e164); // e.g. msisdn-123456789

    this.logger.log(`Verifying subscriber in free5gc identity store: ${gpsi}`);

    const db = await this.getDb();
    const record = await db
      .collection('subscriptionData.identityData')
      .findOne({ gpsi });

    if (!record) {
      this.logger.warn(`Subscriber ${gpsi} not found in free5gc identity data`);
      // demo err
      throw new ApiException(
        403,
        ErrorCode[
          'NUMBER_VERIFICATION.USER_NOT_AUTHENTICATED_BY_MOBILE_NETWORK'
        ],
        'Subscriber is not registered in the mobile network', // demo err
      );
    }

    this.logger.log(
      `Subscriber confirmed: ueId=${record.ueId}, gpsi=${record.gpsi}`,
    );
    return e164;
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
      this.logger.log('MongoDB connection closed');
    }
  }
}
