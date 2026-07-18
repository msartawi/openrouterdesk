import type { RouterAdapter, RouterConnectionContext } from '../core/RouterAdapter';
import type { AdapterProbeResult, DeviceNode } from '../../shared/contracts';

export class MockRouterAdapter implements RouterAdapter {
  readonly id = 'mock';
  readonly displayName = 'Mock Router';
  readonly capabilities = new Set(['device.inventory.read']);

  async probe(_context: RouterConnectionContext): Promise<AdapterProbeResult> {
    return {
      adapterId: this.id,
      compatible: true,
      confidence: 'high',
      evidence: ['Development mock adapter is active.'],
    };
  }

  async getConnectedDevices(_context: RouterConnectionContext): Promise<DeviceNode[]> {
    return [
      {
        id: 'mock-router',
        displayName: 'Router',
        ipv4: '192.168.1.1',
        connectionType: 'ethernet',
        source: 'mock',
        confidence: 'high',
      },
      {
        id: 'mock-workstation',
        displayName: 'Workstation',
        ipv4: '192.168.1.240',
        connectionType: 'ethernet',
        source: 'mock',
        confidence: 'high',
      },
    ];
  }
}
