/**
 * Domain types for the CAMARA Number Verification API
 * Based on: docs/NumberVerification/number-verification.yaml
 */

// ─── CAMARA Number Verification API types ──────────────────────────────────

/** Request body for POST /verify */
export interface NumberVerificationRequestBody {
  /**
   * Plain-text E.164 phone number.
   * Exactly one of `phoneNumber` or `hashedPhoneNumber` must be provided.
   */
  phoneNumber?: string;

  /**
   * SHA-256 digest (64 hex chars) of the E.164 phone number.
   * Exactly one of `phoneNumber` or `hashedPhoneNumber` must be provided.
   */
  hashedPhoneNumber?: string;
}

/** Response body for POST /verify */
export interface NumberVerificationMatchResponse {
  /** `true` if the supplied number matches the one associated with the access token */
  devicePhoneNumberVerified: boolean;
}

/** Response body for GET /device-phone-number */
export interface NumberVerificationShareResponse {
  /** E.164 phone number associated with the end-user's SIM by the network operator */
  devicePhoneNumber: string;
}
