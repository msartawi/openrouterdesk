import { contextBridge, ipcRenderer } from 'electron';
import type { OpenRouterDeskApi } from '../shared/contracts';

const api: OpenRouterDeskApi = {
  getDashboardSnapshot: () => ipcRenderer.invoke('dashboard:get-snapshot'),
  getAppInfo: () => ipcRenderer.invoke('app:get-info'),
};

contextBridge.exposeInMainWorld('openRouterDesk', Object.freeze(api));
