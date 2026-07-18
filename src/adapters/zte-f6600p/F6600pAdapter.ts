import type { RouterAdapter, RouterConnectionContext } from '../core/RouterAdapter';
import type { AdapterProbeResult, DeviceNode } from '../../shared/contracts';

/**
 * Read-only placeholder for the first live adapter.
 *
 * Do not add configuration writes here. Implement transport, sanitized fixtures,
 * parser tests, and session handling first.
 */
export class F6600pAdapter implements RouterAdapter {
  readonly id = 'zte-f6600p';
  readonly displayName = 'ZTE F6600P';
  readonly capabilities = new Set<string>();

  async probe(_context: RouterConnectionContext): Promise<AdapterProbeResult> {
    return {
      adapterId: this.id,
      compatible: false,
      confidence: 'low',
      evidence: ['Live F6600P probing has not been implemented yet.'],
    };
  }

  async getConnectedDevices(_context: RouterConnectionContext): Promise<DeviceNode[]> {
    throw new Error('CAPABILITY_UNSUPPORTED: F6600P inventory is not implemented.');
  }
}
