import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ApiException } from '../exceptions/api-exception';
import { ErrorCode } from '../exceptions/error-code.enum';

@Injectable()
export class PhoneIdentifierGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const sub = request.jwtPayload?.sub;

    // THREE-LEGGED: sub starts with tel: or operatortoken:
    if (sub && (sub.startsWith('tel:') || sub.startsWith('operatortoken:'))) {
      if (request.body?.phoneNumber) {
        throw new ApiException(
          422,
          ErrorCode.UNNECESSARY_IDENTIFIER,
          'The phone number is already identified by the access token.',
        );
      }
      const phone = sub.startsWith('tel:') ? sub.slice(4) : '';
      request.phoneIdentifier = phone;
    } else if (!request.body?.phoneNumber) {
      throw new ApiException(
        422,
        ErrorCode.MISSING_IDENTIFIER,
        'The phone number cannot be identified.',
      );
    }

    return true;
  }
}
