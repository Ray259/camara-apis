export type ScoringType = 'gaugeMetric' | 'veritasIndex';

export interface ScoringRequest {
  idDocument?: string;
  phoneNumber?: string;
  scoringType?: ScoringType;
}

export interface ScoringResponse {
  scoringType: ScoringType;
  scoringValue: number;
}

export interface CustomerInsightsRecord {
  phoneNumber: string;
  idDocument?: string;
  gaugeMetricScore: number;
  veritasIndexScore: number;
  serviceApplicable: boolean;
}
