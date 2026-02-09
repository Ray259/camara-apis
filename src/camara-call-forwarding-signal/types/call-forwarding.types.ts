export type CallForwardingStatus =
  | 'inactive'
  | 'unconditional'
  | 'conditional_busy'
  | 'conditional_not_reachable'
  | 'conditional_no_answer';

export interface CallForwardingRecord {
  /** E.164 format */
  phoneNumber: string;
  unconditionalActive: boolean;
  conditionalStatuses: CallForwardingStatus[];
}

export interface UnconditionalCallForwardingResponse {
  active: boolean;
}
