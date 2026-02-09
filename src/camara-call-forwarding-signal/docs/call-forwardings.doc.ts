import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CreateCallForwardingSignalDto } from '../dtos/create-call-forwarding.dto';

export function PostCallForwardingsDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Check all call forwarding statuses' }),
    ApiBody({ type: CreateCallForwardingSignalDto }),
    ApiResponse({
      status: 200,
      description: 'OK',
      schema: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['inactive', 'unconditional', 'conditional_busy', 'conditional_not_reachable', 'conditional_no_answer'],
        },
      },
    }),
    ApiResponse({ status: 400, description: 'INVALID_ARGUMENT' }),
    ApiResponse({ status: 401, description: 'UNAUTHENTICATED' }),
    ApiResponse({ status: 404, description: 'IDENTIFIER_NOT_FOUND' }),
    ApiResponse({ status: 422, description: 'MISSING_IDENTIFIER or UNNECESSARY_IDENTIFIER' }),
  );
}
