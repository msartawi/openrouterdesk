export type RouterProtocol = 'http' | 'https';

export interface RouterProfileSummary {
  id: string;
  displayName: string;
  target: string;
  protocol: RouterProtocol;
  adapterId: string;
  username: string;
}

export type EvidenceSource = 'router-reported' | 'locally-observed' | 'inferred' | 'mock';
export type Confidence = 'high' | 'medium' | 'low';

export interface AdapterProbeResult {
  adapterId: string;
  compatible: boolean;
  confidence: Confidence;
  evidence: string[];
}

export interface DeviceNode {
  id: string;
  displayName: string;
  ipv4?: string;
  ipv6?: string;
  macAddress?: string;
  connectionType: 'ethernet' | 'wifi' | 'unknown';
  vlanId?: number;
  source: EvidenceSource;
  confidence: Confidence;
  lastSeen?: string;
}

/** Observed F6600P loopback/port VLAN assignment (read-only). */
export interface LoopbackVlan {
  instId: string;
  portId: string;
  vlanCount: number;
  vids: number[];
  source: EvidenceSource;
  confidence: Confidence;
}

export interface DashboardSnapshot {
  appVersion: string;
  mode: 'mock' | 'live';
  adapter: AdapterProbeResult;
  devices: DeviceNode[];
  warnings: string[];
}

export type AppResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } };

export interface OpenRouterDeskApi {
  getDashboardSnapshot(): Promise<AppResult<DashboardSnapshot>>;
  getAppInfo(): Promise<AppResult<{ version: string; platform: string }>>;
}
