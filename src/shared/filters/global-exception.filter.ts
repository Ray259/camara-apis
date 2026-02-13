import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiException } from '../exceptions/api-exception';
import { ErrorCode } from '../exceptions/error-code.enum';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ApiException) {
      response.status(exception.statusCode).json(exception.toResponse());
      return;
    }

    // Handle BadRequestException from ValidationPipe
    if (exception instanceof BadRequestException) {
      response.status(400).json({
        status: 400,
        code: ErrorCode.INVALID_ARGUMENT,
        message:
          'Client specified an invalid argument, request body or query param.',
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        response.status(status).json(exceptionResponse);
        return;
      }

      response.status(status).json({
        status,
        code: 'INTERNAL_ERROR',
        message: exceptionResponse,
      });
      return;
    }

    console.error('Unexpected error:', exception);
    response.status(500).json({
      status: 500,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    });
  }
}
