import { ApiException } from '../exceptions/api-exception';
import { ErrorCode } from '../exceptions/error-code.enum';

export const PHONE_REGEX = /^\+[1-9][0-9]{4,14}$/;

export const validatePhone = (phoneNumber: string): void => {
  if (!phoneNumber || !PHONE_REGEX.test(phoneNumber)) {
    throw new ApiException(
      400,
      ErrorCode.INVALID_ARGUMENT,
      'Client specified an invalid argument, request body or query param.',
    );
  }
};
