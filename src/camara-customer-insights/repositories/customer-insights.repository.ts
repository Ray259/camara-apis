import { Injectable } from '@nestjs/common';
import {
  ScoringType,
  ScoringResponse,
  CustomerInsightsRecord,
} from '../types/customer-insights.types';

export interface ICustomerInsightsRepository {
  getScoring(
    phoneNumber: string,
    scoringType: ScoringType,
  ): Promise<ScoringResponse>;
  phoneNumberExists(phoneNumber: string): Promise<boolean>;
  validateIdDocument(phoneNumber: string, idDocument: string): Promise<boolean>;
  isServiceApplicable(phoneNumber: string): Promise<boolean>;
}

export const CUSTOMER_INSIGHTS_REPOSITORY = 'CUSTOMER_INSIGHTS_REPOSITORY';

@Injectable()
export class InMemoryCustomerInsightsRepository implements ICustomerInsightsRepository {
  private records: CustomerInsightsRecord[] = [
    {
      phoneNumber: '+123456789',
      idDocument: '987654321',
      gaugeMetricScore: 750,
      veritasIndexScore: 4,
      serviceApplicable: true,
    },
    {
      phoneNumber: '+556253423432',
      idDocument: '123456789',
      gaugeMetricScore: 600,
      veritasIndexScore: 8,
      serviceApplicable: true,
    },
    {
      phoneNumber: '+198765432',
      idDocument: '111222333',
      gaugeMetricScore: 820,
      veritasIndexScore: 1,
      serviceApplicable: true,
    },
    {
      phoneNumber: '+111111111',
      gaugeMetricScore: 450,
      veritasIndexScore: 14,
      serviceApplicable: false,
    },
  ];

  async phoneNumberExists(phoneNumber: string): Promise<boolean> {
    return this.records.some((r) => r.phoneNumber === phoneNumber);
  }

  async validateIdDocument(
    phoneNumber: string,
    idDocument: string,
  ): Promise<boolean> {
    const record = this.records.find((r) => r.phoneNumber === phoneNumber);
    if (!record || !record.idDocument) {
      return false;
    }
    return record.idDocument === idDocument;
  }

  async isServiceApplicable(phoneNumber: string): Promise<boolean> {
    const record = this.records.find((r) => r.phoneNumber === phoneNumber);
    return record?.serviceApplicable ?? false;
  }

  async getScoring(
    phoneNumber: string,
    scoringType: ScoringType,
  ): Promise<ScoringResponse> {
    const record = this.records.find((r) => r.phoneNumber === phoneNumber);

    if (!record) {
      return { scoringType, scoringValue: 0 };
    }

    const scoringValue =
      scoringType === 'gaugeMetric'
        ? record.gaugeMetricScore
        : record.veritasIndexScore;

    return { scoringType, scoringValue };
  }
}
