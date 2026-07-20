import { isIP } from 'node:net';

const BLOCKED_HOSTNAMES = new Set(['localhost', 'localhost.localdomain']);

/** True for loopback, link-local, and RFC1918 IPv4 addresses. */
export function isPrivateOrLocalIpv4(ip: string): boolean {
  if (isIP(ip) !== 4) return false;
  const parts = ip.split('.').map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return false;
  const [a, b] = parts as [number, number, number, number];
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

export type LocalTargetErrorCode =
  | 'TARGET_INVALID'
  | 'TARGET_HOSTNAME_NOT_ALLOWED'
  | 'TARGET_NOT_LOCAL'
  | 'TARGET_PROTOCOL_UNSUPPORTED';

export class LocalTargetError extends Error {
  readonly code: LocalTargetErrorCode;

  constructor(code: LocalTargetErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'LocalTargetError';
  }
}

/**
 * Build and validate a router base URL. MVP requires a literal private/local IPv4 host
 * (no public DNS names) to keep traffic on the LAN.
 */
export function resolveLocalRouterUrl(input: {
  target: string;
  protocol: 'http' | 'https';
  path?: string;
}): URL {
  const host = input.target.trim();
  if (!host) {
    throw new LocalTargetError('TARGET_INVALID', 'Router target is empty.');
  }

  if (BLOCKED_HOSTNAMES.has(host.toLowerCase())) {
    // localhost string form — still allow via 127.0.0.1 only
    throw new LocalTargetError(
      'TARGET_HOSTNAME_NOT_ALLOWED',
      'Use an IPv4 address such as 127.0.0.1 instead of a hostname.',
    );
  }

  if (isIP(host) === 0) {
    throw new LocalTargetError(
      'TARGET_HOSTNAME_NOT_ALLOWED',
      'Router target must be a literal IPv4 address on the local network.',
    );
  }

  if (isIP(host) === 6) {
    throw new LocalTargetError(
      'TARGET_HOSTNAME_NOT_ALLOWED',
      'IPv6 router targets are not supported in this phase.',
    );
  }

  if (!isPrivateOrLocalIpv4(host)) {
    throw new LocalTargetError(
      'TARGET_NOT_LOCAL',
      'Router target must be a private or local IPv4 address.',
    );
  }

  if (input.protocol !== 'http' && input.protocol !== 'https') {
    throw new LocalTargetError('TARGET_PROTOCOL_UNSUPPORTED', 'Only http and https are allowed.');
  }

  const path = input.path?.startsWith('/') ? input.path : `/${input.path ?? ''}`;
  return new URL(`${input.protocol}://${host}${path === '/' ? '/' : path}`);
}
