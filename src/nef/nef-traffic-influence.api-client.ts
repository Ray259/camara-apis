import { TrafficInfluSub } from './types/nef.types';

export const NEF_TRAFFIC_INFLUENCE_API_CLIENT =
  'NEF_TRAFFIC_INFLUENCE_API_CLIENT';

/** Callers pass and receive phone numbers in E.164 format. */
export interface INefTrafficInfluenceApiClient {
  /** POST /{afId}/subscriptions */
  postSubscription(
    afId: string,
    body: TrafficInfluSub,
  ): Promise<TrafficInfluSub>;
}
