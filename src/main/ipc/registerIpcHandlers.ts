import { app, ipcMain } from 'electron';
import { getDashboardSnapshot } from '../../services/dashboardService';
import type { AppResult } from '../../shared/contracts';
import { isTrustedIpcSender } from '../security/navigationPolicy';

function unauthorized<T>(): AppResult<T> {
  return { ok: false, error: { code: 'IPC_UNAUTHORIZED', message: 'The request origin is not trusted.' } };
}

export function registerIpcHandlers(): void {
  ipcMain.handle('app:get-info', (event): AppResult<{ version: string; platform: string }> => {
    if (!isTrustedIpcSender(event.sender)) return unauthorized();
    return { ok: true, value: { version: app.getVersion(), platform: process.platform } };
  });

  ipcMain.handle('dashboard:get-snapshot', async (event) => {
    if (!isTrustedIpcSender(event.sender)) return unauthorized();
    return getDashboardSnapshot();
  });
}
