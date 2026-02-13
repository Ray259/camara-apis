import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ApiException } from '../exceptions/api-exception';
import { ErrorCode } from '../exceptions/error-code.enum';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new ApiException(
        401,
        ErrorCode.UNAUTHENTICATED,
        'Request not authenticated due to missing, invalid, or expired credentials. A new authentication is required.',
      );
    }

    const [, token] = authHeader.split(' ');
    if (typeof token !== 'string' || !token) {
      throw new ApiException(
        401,
        ErrorCode.UNAUTHENTICATED,
        'Request not authenticated due to missing, invalid, or expired credentials. A new authentication is required.',
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      request.jwtPayload = decoded;
      return true;
    } catch {
      throw new ApiException(
        401,
        ErrorCode.UNAUTHENTICATED,
        'Request not authenticated due to missing, invalid, or expired credentials. A new authentication is required.',
      );
    }
  }
}
