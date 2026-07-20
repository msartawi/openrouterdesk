export type TransportMethod = 'GET' | 'HEAD';

export interface TransportRequest {
  /** Absolute URL already validated as local-only. */
  url: string;
  method?: TransportMethod;
  headers?: Record<string, string>;
  timeoutMs?: number;
  maxBytes?: number;
  /** When true (default), first HTTPS sighting may record fingerprint; later must match. */
  trustOnFirstUse?: boolean;
  signal?: AbortSignal;
}

export interface TransportResponse {
  status: number;
  headers: Record<string, string>;
  bodyText: string;
  finalUrl: string;
  tlsFingerprintSha256?: string;
}

export interface HttpTransport {
  request(req: TransportRequest): Promise<TransportResponse>;
}

export const DEFAULT_TIMEOUT_MS = 10_000;
export const DEFAULT_MAX_BYTES = 1_500_000;

export class TransportError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'TransportError';
  }
}
