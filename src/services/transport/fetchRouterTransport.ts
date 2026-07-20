import http from 'node:http';
import https from 'node:https';
import type { IncomingMessage } from 'node:http';
import type { PeerCertificate } from 'node:tls';
import {
  MemoryCertificateTrustStore,
  sha256FingerprintFromDer,
  type CertificateTrustStore,
} from './certificateTrust';
import {
  DEFAULT_MAX_BYTES,
  DEFAULT_TIMEOUT_MS,
  TransportError,
  type HttpTransport,
  type TransportRequest,
  type TransportResponse,
} from './types';

function headersToRecord(headers: IncomingMessage['headers']): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    out[key.toLowerCase()] = Array.isArray(value) ? value.join(', ') : value;
  }
  return out;
}

function readBody(res: IncomingMessage, maxBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    res.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > maxBytes) {
        res.destroy();
        reject(
          new TransportError(
            'RESPONSE_TOO_LARGE',
            `Router response exceeded ${maxBytes} bytes.`,
          ),
        );
        return;
      }
      chunks.push(chunk);
    });
    res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    res.on('error', (err) => reject(err));
  });
}

export interface FetchRouterTransportOptions {
  trustStore?: CertificateTrustStore;
}

/**
 * Main-process router HTTP(S) client: local targets only (caller must validate URL),
 * no automatic redirects, bounded timeout/size, HTTPS fingerprint TOFU.
 * Read-only methods (GET/HEAD) only.
 */
export class FetchRouterTransport implements HttpTransport {
  private readonly trustStore: CertificateTrustStore;

  constructor(options: FetchRouterTransportOptions = {}) {
    this.trustStore = options.trustStore ?? new MemoryCertificateTrustStore();
  }

  async request(req: TransportRequest): Promise<TransportResponse> {
    const method = req.method ?? 'GET';
    if (method !== 'GET' && method !== 'HEAD') {
      throw new TransportError('METHOD_NOT_ALLOWED', 'Only GET and HEAD are permitted.');
    }

    let url: URL;
    try {
      url = new URL(req.url);
    } catch {
      throw new TransportError('URL_INVALID', 'Transport URL is invalid.');
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new TransportError('PROTOCOL_UNSUPPORTED', 'Only http and https are permitted.');
    }

    const timeoutMs = req.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const maxBytes = req.maxBytes ?? DEFAULT_MAX_BYTES;
    const trustOnFirstUse = req.trustOnFirstUse !== false;

    return new Promise<TransportResponse>((resolve, reject) => {
      const lib = url.protocol === 'https:' ? https : http;
      let settled = false;

      const fail = (err: unknown) => {
        if (settled) return;
        settled = true;
        reject(err instanceof Error ? err : new Error(String(err)));
      };

      const succeed = (value: TransportResponse) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      const requestOptions: http.RequestOptions = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method,
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'OpenRouterDesk/0.1 (local-read-only)',
          ...req.headers,
        },
        timeout: timeoutMs,
      };

      if (url.protocol === 'https:') {
        (requestOptions as https.RequestOptions).rejectUnauthorized = false;
        (requestOptions as https.RequestOptions).servername = url.hostname;
      }

      const outgoing = lib.request(requestOptions, (res) => {
        const status = res.statusCode ?? 0;

        // No redirects by default — surface 3xx as-is without following.
        if (status >= 300 && status < 400) {
          res.resume();
          succeed({
            status,
            headers: headersToRecord(res.headers),
            bodyText: '',
            finalUrl: url.toString(),
          });
          return;
        }

        void readBody(res, maxBytes)
          .then((bodyText) => {
            let tlsFingerprintSha256: string | undefined;
            if (url.protocol === 'https:') {
              const socket = res.socket as { getPeerCertificate?: () => PeerCertificate };
              const cert = socket.getPeerCertificate?.();
              if (cert?.raw) {
                tlsFingerprintSha256 = sha256FingerprintFromDer(Buffer.from(cert.raw));
                const hostKey = url.hostname.toLowerCase();
                const known = this.trustStore.get(hostKey);
                if (known) {
                  if (known !== tlsFingerprintSha256) {
                    fail(
                      new TransportError(
                        'TLS_FINGERPRINT_MISMATCH',
                        'HTTPS certificate fingerprint does not match the trusted record.',
                      ),
                    );
                    return;
                  }
                } else if (trustOnFirstUse) {
                  this.trustStore.set(hostKey, tlsFingerprintSha256);
                } else {
                  fail(
                    new TransportError(
                      'TLS_FINGERPRINT_UNKNOWN',
                      'HTTPS certificate is not trusted yet.',
                    ),
                  );
                  return;
                }
              }
            }

            const response: TransportResponse = {
              status,
              headers: headersToRecord(res.headers),
              bodyText,
              finalUrl: url.toString(),
            };
            if (tlsFingerprintSha256 !== undefined) {
              response.tlsFingerprintSha256 = tlsFingerprintSha256;
            }
            succeed(response);
          })
          .catch(fail);
      });

      outgoing.on('timeout', () => {
        outgoing.destroy();
        fail(new TransportError('TIMEOUT', `Router request timed out after ${timeoutMs}ms.`));
      });

      outgoing.on('error', fail);

      if (req.signal) {
        if (req.signal.aborted) {
          outgoing.destroy();
          fail(new TransportError('ABORTED', 'Router request was cancelled.'));
          return;
        }
        req.signal.addEventListener(
          'abort',
          () => {
            outgoing.destroy();
            fail(new TransportError('ABORTED', 'Router request was cancelled.'));
          },
          { once: true },
        );
      }

      outgoing.end();
    });
  }
}
