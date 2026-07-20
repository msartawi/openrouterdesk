import type { RouterAdapter, RouterConnectionContext } from '../core/RouterAdapter';
import type {
  AdapterProbeResult,
  DeviceNode,
  LoopbackVlan,
} from '../../shared/contracts';
import { parseLoopbackVlansXml } from './loopbackVlan';
import { probeF6600pRootPage } from './probe';

/**
 * Read-only F6600P adapter.
 *
 * Probe uses injected HttpTransport (fixture in CI, live FetchRouterTransport in main).
 * VLAN XML parsing remains offline/fixture-oriented. No configuration writes.
 */
export class F6600pAdapter implements RouterAdapter {
  readonly id = 'zte-f6600p';
  readonly displayName = 'ZTE F6600P';
  readonly capabilities = new Set(['vlan.inventory.read', 'device.probe']);

  async probe(context: RouterConnectionContext): Promise<AdapterProbeResult> {
    if (!context.transport) {
      return {
        adapterId: this.id,
        compatible: false,
        confidence: 'low',
        evidence: [
          'No transport provided. Inject FixtureTransport or FetchRouterTransport for probing.',
        ],
      };
    }

    try {
      return await probeF6600pRootPage(context, context.transport);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Probe failed.';
      return {
        adapterId: this.id,
        compatible: false,
        confidence: 'low',
        evidence: [`Probe error: ${message}`],
      };
    }
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
