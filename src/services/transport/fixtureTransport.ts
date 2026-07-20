import { TransportError, type HttpTransport, type TransportRequest, type TransportResponse } from './types';

export interface FixtureRoute {
  /** Match pathname (+ optional search prefix). */
  match: RegExp | string;
  status?: number;
  bodyText: string;
  headers?: Record<string, string>;
}

/** Deterministic transport for CI — no network. */
export class FixtureTransport implements HttpTransport {
  constructor(private readonly routes: FixtureRoute[]) {}

  async request(req: TransportRequest): Promise<TransportResponse> {
    const url = new URL(req.url);
    const key = `${url.pathname}${url.search}`;
    for (const route of this.routes) {
      const ok =
        typeof route.match === 'string' ? key === route.match || url.pathname === route.match : route.match.test(key);
      if (!ok) continue;
      return {
        status: route.status ?? 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          ...route.headers,
        },
        bodyText: route.bodyText,
        finalUrl: url.toString(),
      };
    }
    throw new TransportError('FIXTURE_MISS', `No fixture route for ${key}`);
  }
}
