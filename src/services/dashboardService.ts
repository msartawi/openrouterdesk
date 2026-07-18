import { app } from 'electron';
import { MockRouterAdapter } from '../adapters/mock/MockRouterAdapter';
import type { AppResult, DashboardSnapshot } from '../shared/contracts';

const adapter = new MockRouterAdapter();

export async function getDashboardSnapshot(): Promise<AppResult<DashboardSnapshot>> {
  try {
    const context = { target: '192.168.1.1', protocol: 'http' as const };
    const [probe, devices] = await Promise.all([
      adapter.probe(context),
      adapter.getConnectedDevices(context),
    ]);

    return {
      ok: true,
      value: {
        appVersion: app.getVersion(),
        mode: 'mock',
        adapter: probe,
        devices,
        warnings: [
          'Mock mode is active. No router requests are being sent.',
          'Live configuration writes and firmware upload are disabled.',
        ],
      },
    };
  } catch {
    return {
      ok: false,
      error: {
        code: 'DASHBOARD_FAILED',
        message: 'The dashboard data could not be loaded.',
      },
    };
  }
}
