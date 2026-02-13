// ─── NEF Traffic Influence API types ───────────────────────────────────────
export interface TrafficInfluSub {
  afServiceId?: string;
  afAppId?: string;
  afTransId?: string;
  appReloInd?: boolean;
  dnn?: string;
  snssai?: Snssai;
  externalGroupId?: string;
  externalGroupIds?: string[];
  anyUeInd?: boolean;
  subscribedEvents?: SubscribedEvent[];
  gpsi?: string;
  ipv4Addr?: string;
  ipDomain?: string;
  ipv6Addr?: string;
  macAddr?: string;
  dnaiChgType?: DnaiChangeType;
  notificationDestination?: string;
  requestTestNotification?: boolean;
  self?: string;
  trafficFilters?: FlowInfo[];
  trafficRoutes?: RouteToLocation[];
  tempValidities?: TemporalValidity[];
  validGeoZoneIds?: string[];
  afAckInd?: boolean;
  addrPreserInd?: boolean;
  simConnInd?: boolean;
  simConnTerm?: number;
  maxAllowedUpLat?: number;
  easRedisInd?: boolean;
  suppFeat?: string;
  subscriptionId?: string;
  createdAt?: Date;
}

export interface Snssai {
  sst: number;
  sd?: string;
}

export interface FlowInfo {
  flowId: number;
  flowDescriptions?: string[];
}

export interface RouteToLocation {
  dnai: string;
  routeInfo?: RouteInformation;
  routeProfId?: string;
}

export interface RouteInformation {
  ipv4Addr?: string;
  ipv6Addr?: string;
  portNumber?: number;
}

export interface TemporalValidity {
  startTime?: string;
  stopTime?: string;
}

export type SubscribedEvent = 'UP_PATH_CHANGE' | string;
export type DnaiChangeType = 'EARLY' | 'EARLY_LATE' | 'LATE' | string;

/** The request body shape for POST /{afId}/subscriptions */
export type CreateTrafficInfluSubRequest = Omit<
  TrafficInfluSub,
  'subscriptionId' | 'self' | 'createdAt'
>;
