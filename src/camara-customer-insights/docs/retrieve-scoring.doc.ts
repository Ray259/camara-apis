import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { ScoringRequestDto } from '../dtos/scoring-request.dto';
import { ScoringResponseDto } from '../dtos/scoring-response.dto';

export function RetrieveScoringDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieves Scoring information',
      description: 'Retrieves Scoring information for the user associated with the provided idDocument, phoneNumber or the combination of both parameters.',
    }),
    ApiHeader({
      name: 'x-correlator',
      required: false,
      description: 'Correlation id for the different services',
    }),
    ApiBody({ type: ScoringRequestDto }),
    ApiResponse({
      status: 200,
      description: 'Scoring result.',
      type: ScoringResponseDto,
    }),
    ApiResponse({ status: 400, description: 'INVALID_ARGUMENT - Invalid request format' }),
    ApiResponse({ status: 401, description: 'UNAUTHENTICATED - Missing or invalid credentials' }),
    ApiResponse({ status: 403, description: 'PERMISSION_DENIED - Insufficient permissions' }),
    ApiResponse({ status: 404, description: 'NOT_FOUND / IDENTIFIER_NOT_FOUND - Resource or phone not found' }),
    ApiResponse({ status: 422, description: 'MISSING_IDENTIFIER / UNNECESSARY_IDENTIFIER / SERVICE_NOT_APPLICABLE / CUSTOMER_INSIGHTS.* errors' }),
    ApiResponse({ status: 429, description: 'TOO_MANY_REQUESTS - Rate limit exceeded' }),
  );
}
