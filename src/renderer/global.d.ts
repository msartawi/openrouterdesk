import type { OpenRouterDeskApi } from '../shared/contracts';

declare global {
  interface Window {
    openRouterDesk: OpenRouterDeskApi;
  }
}

export {};
