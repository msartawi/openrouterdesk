import type { BrowserWindow, WebContents } from 'electron';

function isAllowedRendererUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    if (url.protocol === 'file:') return true;
    return process.env.VITE_DEV_SERVER_URL !== undefined && url.origin === 'http://127.0.0.1:5173';
  } catch {
    return false;
  }
}

export function applyNavigationPolicy(window: BrowserWindow): void {
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  window.webContents.on('will-navigate', (event, targetUrl) => {
    if (!isAllowedRendererUrl(targetUrl)) event.preventDefault();
  });
}

export function isTrustedIpcSender(sender: WebContents): boolean {
  return isAllowedRendererUrl(sender.getURL());
}
