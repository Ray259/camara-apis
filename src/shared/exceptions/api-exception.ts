import { HttpException } from '@nestjs/common';
import { ErrorCode } from './error-code.enum';

export interface ApiErrorResponse {
  status: number;
  code: ErrorCode;
  message: string;
}

export class ApiException extends HttpException {
  constructor(
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    message?: string,
  ) {
    super({ status: statusCode, code, message: message || code }, statusCode);
  }

  toResponse(): ApiErrorResponse {
    return {
      status: this.statusCode,
      code: this.code,
      message: this.message,
    };
  }
}
