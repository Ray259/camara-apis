import { Injectable, Inject } from '@nestjs/common';
import { ApiException } from '@/shared/exceptions/api-exception';
import { ErrorCode } from '@/shared/exceptions/error-code.enum';
import { validatePhone } from '@/shared/utils/phone-validation.util';
import {
  ICustomerInsightsRepository,
  CUSTOMER_INSIGHTS_REPOSITORY,
} from '../repositories/customer-insights.repository';
import { ScoringType, ScoringResponse } from '../types/customer-insights.types';

const DEFAULT_SCORING_TYPE: ScoringType = 'gaugeMetric';

@Injectable()
export class CustomerInsightsService {
  constructor(
    @Inject(CUSTOMER_INSIGHTS_REPOSITORY)
    private readonly repository: ICustomerInsightsRepository,
  ) {}

  private async ensurePhoneExists(phoneNumber: string): Promise<void> {
    const exists = await this.repository.phoneNumberExists(phoneNumber);
    if (!exists) {
      throw new ApiException(
        404,
        ErrorCode.IDENTIFIER_NOT_FOUND,
        'phoneNumber not found.',
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

  private validateScoringType(scoringType: ScoringType | undefined): ScoringType {
    if (!scoringType) {
      return DEFAULT_SCORING_TYPE;
    }

    const validTypes: ScoringType[] = ['gaugeMetric', 'veritasIndex'];
    if (!validTypes.includes(scoringType)) {
      throw new ApiException(
        422,
        ErrorCode['CUSTOMER_INSIGHTS.SCALE_TYPE_NOT_SUPPORTED'],
        'Indicated parameter `scoringType` is not supported.',
      );
    }

    return scoringType;
  }

  private async validateIdDocument(
    phoneNumber: string,
    idDocument: string | undefined,
  ): Promise<void> {
    if (!idDocument) {
      return;
    }

    const isValid = await this.repository.validateIdDocument(phoneNumber, idDocument);
    if (!isValid) {
      throw new ApiException(
        422,
        ErrorCode['CUSTOMER_INSIGHTS.INVALID_IDENTIFIERS'],
        'The request contains invalid data.',
      );
    }
  }

  async retrieveScoring(
    phoneIdentifier: string | undefined,
    bodyPhoneNumber: string | undefined,
    idDocument: string | undefined,
    scoringType: ScoringType | undefined,
  ): Promise<ScoringResponse> {
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
    await this.ensureServiceApplicable(phoneNumber);
    await this.validateIdDocument(phoneNumber, idDocument);

    const validatedScoringType = this.validateScoringType(scoringType);

    return this.repository.getScoring(phoneNumber, validatedScoringType);
  }
}
