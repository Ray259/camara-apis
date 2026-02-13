import { Module } from '@nestjs/common';
import { NEF_TRAFFIC_INFLUENCE_API_CLIENT } from './nef-traffic-influence.api-client';
import { MockNefTrafficInfluenceApiClient } from './nef-traffic-influence.api-client.mock';
import { HttpNefTrafficInfluenceApiClient } from './nef-traffic-influence.api-client.http';

@Module({
  providers: [
    {
      provide: NEF_TRAFFIC_INFLUENCE_API_CLIENT,
      useFactory: () => {
        const baseUrl = process.env.NEF_BASE_URL;
        if (baseUrl) {
          return new HttpNefTrafficInfluenceApiClient(baseUrl);
        }
        return new MockNefTrafficInfluenceApiClient();
      },
    },
  ],
  exports: [NEF_TRAFFIC_INFLUENCE_API_CLIENT],
})
export class NefModule {}
