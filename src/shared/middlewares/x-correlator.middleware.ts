import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiException } from '../exceptions/api-exception';
import { ErrorCode } from '../exceptions/error-code.enum';
import { validateXCorrelator } from '../utils/correlator-validation.util';

@Injectable()
export class XCorrelatorMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlatorId = req.headers['x-correlator'] as string | undefined;

    if (correlatorId) {
      if (!validateXCorrelator(correlatorId)) {
        throw new ApiException(
          400,
          ErrorCode.INVALID_ARGUMENT,
          'Client specified an invalid argument, request body or query param.',
        );
      }
      res.setHeader('x-correlator', correlatorId);
    }

    next();
  }
}
