import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CreateSimSwapDateDto } from '../dtos/create-sim-swap-date.dto';

export function PostRetrieveDateDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get last SIM swap date' }),
    ApiBody({ type: CreateSimSwapDateDto }),
    ApiResponse({
      status: 200,
      description: 'Contains information about SIM swap change',
    }),
    ApiResponse({ status: 400, description: 'INVALID_ARGUMENT' }),
    ApiResponse({ status: 401, description: 'UNAUTHENTICATED' }),
    ApiResponse({ status: 403, description: 'PERMISSION_DENIED' }),
    ApiResponse({ status: 404, description: 'NOT_FOUND or IDENTIFIER_NOT_FOUND' }),
    ApiResponse({ status: 422, description: 'MISSING_IDENTIFIER, UNNECESSARY_IDENTIFIER, or SERVICE_NOT_APPLICABLE' }),
  );
}
