export interface AuthenticatedRequest {
  phoneIdentifier?: string;
  jwtPayload?: { sub?: string };
}
