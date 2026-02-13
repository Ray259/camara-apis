import { Logger } from '@nestjs/common';
import { INefTrafficInfluenceApiClient } from './nef-traffic-influence.api-client';
import { TrafficInfluSub } from './types/nef.types';
import { toNefGpsi, fromNefGpsi } from '../shared/utils/phone-format.util';

export class HttpNefTrafficInfluenceApiClient implements INefTrafficInfluenceApiClient {
  private readonly logger = new Logger(HttpNefTrafficInfluenceApiClient.name);
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async postSubscription(
    afId: string,
    body: TrafficInfluSub,
  ): Promise<TrafficInfluSub> {
    const url = `${this.baseUrl}/3gpp-traffic-influence/v1/${afId}/subscriptions`;

    // E.164 → GPSI before sending to NEF
    const nefBody: TrafficInfluSub = {
      ...body,
      ...(body.gpsi && { gpsi: toNefGpsi(body.gpsi) }),
    };

    this.logger.log(`POST ${url}`);
    this.logger.debug(`Request body: ${JSON.stringify(nefBody, null, 2)}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(nefBody),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`NEF responded ${response.status}: ${text}`);
    }

    const result: TrafficInfluSub = await response.json();

    // GPSI → E.164 on the way back
    return {
      ...result,
      ...(result.gpsi && { gpsi: fromNefGpsi(result.gpsi) }),
    };
  }
}
