import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CreateCallForwardingSignalDto } from '../dtos/create-call-forwarding.dto';
import { UnconditionalCallForwardingSignalDto } from '../dtos/unconditional-call-forwarding-signal.dto';

export function PostUnconditionalCallForwardingsDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Check unconditional call forwarding status' }),
    ApiBody({ type: CreateCallForwardingSignalDto }),
    ApiResponse({
      status: 200,
      description: 'OK',
      type: UnconditionalCallForwardingSignalDto,
    }),
    ApiResponse({ status: 400, description: 'INVALID_ARGUMENT' }),
    ApiResponse({ status: 401, description: 'UNAUTHENTICATED' }),
    ApiResponse({ status: 404, description: 'IDENTIFIER_NOT_FOUND' }),
    ApiResponse({ status: 422, description: 'MISSING_IDENTIFIER or UNNECESSARY_IDENTIFIER' }),
  );
}
