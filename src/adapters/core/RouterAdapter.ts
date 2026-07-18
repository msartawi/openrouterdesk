import type { AdapterProbeResult, DeviceNode } from '../../shared/contracts';

export interface RouterConnectionContext {
  target: string;
  protocol: 'http' | 'https';
}

export interface RouterAdapter {
  readonly id: string;
  readonly displayName: string;
  readonly capabilities: ReadonlySet<string>;

  probe(context: RouterConnectionContext): Promise<AdapterProbeResult>;
  getConnectedDevices(context: RouterConnectionContext): Promise<DeviceNode[]>;
}
