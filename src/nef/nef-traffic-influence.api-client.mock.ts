import { Injectable, Logger } from '@nestjs/common';
import { INefTrafficInfluenceApiClient } from './nef-traffic-influence.api-client';
import { TrafficInfluSub } from './types/nef.types';
import { toNefGpsi, fromNefGpsi } from '../shared/utils/phone-format.util';

/**
 * Simulates the NEF Traffic Influence REST API in memory.
 *
 * E.164 ↔ GPSI conversion is handled here — callers pass and receive E.164.
 */
@Injectable()
export class MockNefTrafficInfluenceApiClient implements INefTrafficInfluenceApiClient {
  private readonly logger = new Logger(MockNefTrafficInfluenceApiClient.name);
  private readonly store = new Map<string, TrafficInfluSub>();
  private idCounter = 1;

  async postSubscription(
    afId: string,
    body: TrafficInfluSub,
  ): Promise<TrafficInfluSub> {
    // Convert E.164 → GPSI before storing (NEF internal format)
    const stored: TrafficInfluSub = {
      ...body,
      ...(body.gpsi && { gpsi: toNefGpsi(body.gpsi) }),
      subscriptionId: `sub-${this.idCounter++}`,
      self: `https://nef.example.com/3gpp-traffic-influence/v1/${afId}/subscriptions/sub-${this.idCounter - 1}`,
      createdAt: new Date(),
    };

    this.store.set(`${afId}/${stored.subscriptionId}`, stored);
    this.logger.log(
      `[MOCK NEF API] POST /${afId}/subscriptions → 201 id=${stored.subscriptionId}`,
    );

    // Return E.164 to the caller — GPSI is an internal detail
    return {
      ...stored,
      ...(stored.gpsi && { gpsi: fromNefGpsi(stored.gpsi) }),
    };
  }

  getAll(): TrafficInfluSub[] {
    return Array.from(this.store.values());
  }

  getOne(afId: string, subscriptionId: string): TrafficInfluSub | undefined {
    return this.store.get(`${afId}/${subscriptionId}`);
  }

  reset(): void {
    this.store.clear();
    this.idCounter = 1;
  }
}
