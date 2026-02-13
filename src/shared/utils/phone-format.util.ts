import * as crypto from 'crypto';
import { ApiException } from '../exceptions/api-exception';
import { ErrorCode } from '../exceptions/error-code.enum';

// ─── E.164 Validation ────────────────────────────────────────────────────────

/** E.164 pattern: +{1-9}{4-14 digits} */
export const PHONE_REGEX = /^\+[1-9][0-9]{4,14}$/;

/** Throws 400 INVALID_ARGUMENT if the phone number is not valid E.164. */
export const validatePhone = (phoneNumber: string): void => {
  if (!phoneNumber || !PHONE_REGEX.test(phoneNumber)) {
    throw new ApiException(
      400,
      ErrorCode.INVALID_ARGUMENT,
      'Client specified an invalid argument, request body or query param.',
    );
  }
};

// ─── GPSI Conversion (3GPP TS 23.003 §28.7) ─────────────────────────────────

/** E.164 `+123456789` → NEF GPSI `msisdn-123456789` */
const GPSI_PREFIX = 'msisdn-';

export const toNefGpsi = (e164: string): string =>
  `${GPSI_PREFIX}${e164.startsWith('+') ? e164.slice(1) : e164}`;

export const fromNefGpsi = (gpsi: string): string =>
  `+${gpsi.startsWith(GPSI_PREFIX) ? gpsi.slice(GPSI_PREFIX.length) : gpsi}`;

export const isNefGpsi = (value: string): boolean =>
  value.startsWith(GPSI_PREFIX);

// ─── Phone Hashing (SHA-256) ─────────────────────────────────────────────────

const SHA256_HEX_REGEX = /^[a-fA-F0-9]{64}$/;

export const hashPhoneNumber = (phoneNumber: string): string =>
  crypto.createHash('sha256').update(phoneNumber).digest('hex');

export const isHashedPhoneNumber = (value: string): boolean =>
  SHA256_HEX_REGEX.test(value);

/** Compares a network E.164 phone against a caller-supplied plain or SHA-256 hashed value. */
export const matchPhoneNumber = (
  networkPhone: string,
  input: string,
): boolean => {
  if (isHashedPhoneNumber(input)) {
    return hashPhoneNumber(networkPhone) === input.toLowerCase();
  }
  return networkPhone === input;
};
