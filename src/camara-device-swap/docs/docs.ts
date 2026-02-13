import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateCheckDeviceSwapDto } from '../dtos/create-check-device-swap.dto';
import { CreateDeviceSwapDateDto } from '../dtos/create-device-swap-date.dto';

export function PostCheckDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Check last device swap date' }),
    ApiBody({ type: CreateCheckDeviceSwapDto }),
    ApiResponse({
      status: 200,
      description:
        'Returns whether a device swap has been performed during a past period',
    }),
    ApiResponse({
      status: 400,
      description: 'INVALID_ARGUMENT or OUT_OF_RANGE',
    }),
    ApiResponse({ status: 401, description: 'UNAUTHENTICATED' }),
    ApiResponse({ status: 403, description: 'PERMISSION_DENIED' }),
    ApiResponse({
      status: 404,
      description: 'NOT_FOUND or IDENTIFIER_NOT_FOUND',
    }),
    ApiResponse({
      status: 422,
      description:
        'MISSING_IDENTIFIER, UNNECESSARY_IDENTIFIER, or SERVICE_NOT_APPLICABLE',
    }),
  );
}

export function PostRetrieveDateDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get last device swap date' }),
    ApiBody({ type: CreateDeviceSwapDateDto }),
    ApiResponse({
      status: 200,
      description: 'Contains information about Device swap change',
    }),
    ApiResponse({ status: 400, description: 'INVALID_ARGUMENT' }),
    ApiResponse({ status: 401, description: 'UNAUTHENTICATED' }),
    ApiResponse({ status: 403, description: 'PERMISSION_DENIED' }),
    ApiResponse({
      status: 404,
      description: 'NOT_FOUND or IDENTIFIER_NOT_FOUND',
    }),
    ApiResponse({
      status: 422,
      description:
        'MISSING_IDENTIFIER, UNNECESSARY_IDENTIFIER, or SERVICE_NOT_APPLICABLE',
    }),
  );
}
