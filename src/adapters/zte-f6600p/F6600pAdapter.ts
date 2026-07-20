import type { RouterAdapter, RouterConnectionContext } from '../core/RouterAdapter';
import type {
  AdapterProbeResult,
  DeviceNode,
  LoopbackVlan,
} from '../../shared/contracts';
import { parseLoopbackVlansXml } from './loopbackVlan';

/**
 * Read-only F6600P adapter.
 *
 * Live transport/session are not implemented yet. VLAN parsing is available
 * offline from sanitized XML fixtures (P0-07).
 */
export class F6600pAdapter implements RouterAdapter {
  readonly id = 'zte-f6600p';
  readonly displayName = 'ZTE F6600P';
  readonly capabilities = new Set(['vlan.inventory.read']);

  async probe(_context: RouterConnectionContext): Promise<AdapterProbeResult> {
    return {
      adapterId: this.id,
      compatible: false,
      confidence: 'low',
      evidence: [
        'Live F6600P probing has not been implemented yet.',
        'Offline OBJ_* / loopback VLAN XML parsing is available for fixtures.',
      ],
    };
  }

  async getConnectedDevices(_context: RouterConnectionContext): Promise<DeviceNode[]> {
    throw new Error('CAPABILITY_UNSUPPORTED: F6600P inventory is not implemented.');
  }

  /**
   * Parse a captured/sanitized loopback VLAN XML body.
   * No network I/O — used by tests and future read-only session code.
   */
  parseLoopbackVlansFromXml(xml: string): LoopbackVlan[] {
    return parseLoopbackVlansXml(xml);
  }
}
