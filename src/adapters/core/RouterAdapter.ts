import type { AdapterProbeResult, DeviceNode } from '../../shared/contracts';
import type { HttpTransport } from '../../services/transport/types';

export interface RouterConnectionContext {
  target: string;
  protocol: 'http' | 'https';
  /** Injected transport (fixture in CI, FetchRouterTransport in main). */
  transport?: HttpTransport;
}

export interface RouterAdapter {
  readonly id: string;
  readonly displayName: string;
  readonly capabilities: ReadonlySet<string>;

  probe(context: RouterConnectionContext): Promise<AdapterProbeResult>;
  getConnectedDevices(context: RouterConnectionContext): Promise<DeviceNode[]>;
}
