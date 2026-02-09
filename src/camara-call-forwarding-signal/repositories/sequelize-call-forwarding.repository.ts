import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ICallForwardingRepository } from './call-forwarding.repository';
import { CallForwardingModel } from '../models/call-forwarding.model';
import { CallForwardingStatus } from '../types/call-forwarding.types';

@Injectable()
export class SequelizeCallForwardingRepository implements ICallForwardingRepository {
  constructor(
    @InjectModel(CallForwardingModel)
    private readonly model: typeof CallForwardingModel,
  ) {}

  async phoneNumberExists(phoneNumber: string): Promise<boolean> {
    const record = await this.model.findByPk(phoneNumber);
    return !!record;
  }

  async getUnconditionalStatus(phoneNumber: string): Promise<boolean> {
    const record = await this.model.findByPk(phoneNumber);
    return record?.unconditionalActive ?? false;
  }

  async getCallForwardingStatuses(phoneNumber: string): Promise<CallForwardingStatus[]> {
    const record = await this.model.findByPk(phoneNumber);
    return (record?.conditionalStatuses as CallForwardingStatus[]) ?? ['inactive'];
  }
}
