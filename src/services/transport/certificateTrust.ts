import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export interface CertificateTrustStore {
  get(host: string): string | undefined;
  set(host: string, fingerprintSha256: string): void;
}

/** In-memory TOFU store for tests. */
export class MemoryCertificateTrustStore implements CertificateTrustStore {
  private readonly map = new Map<string, string>();

  get(host: string): string | undefined {
    return this.map.get(host.toLowerCase());
  }

  set(host: string, fingerprintSha256: string): void {
    this.map.set(host.toLowerCase(), fingerprintSha256.toLowerCase());
  }
}

/** JSON file under a caller-provided directory (Electron userData in production). */
export class FileCertificateTrustStore implements CertificateTrustStore {
  private readonly filePath: string;
  private cache: Record<string, string>;

  constructor(directory: string, fileName = 'tls-fingerprints.json') {
    mkdirSync(directory, { recursive: true });
    this.filePath = path.join(directory, fileName);
    this.cache = {};
    if (existsSync(this.filePath)) {
      try {
        const raw = JSON.parse(readFileSync(this.filePath, 'utf8')) as Record<string, string>;
        this.cache = raw;
      } catch {
        this.cache = {};
      }
    }
  }

  get(host: string): string | undefined {
    const value = this.cache[host.toLowerCase()];
    return value;
  }

  set(host: string, fingerprintSha256: string): void {
    this.cache[host.toLowerCase()] = fingerprintSha256.toLowerCase();
    writeFileSync(this.filePath, `${JSON.stringify(this.cache, null, 2)}\n`, 'utf8');
  }
}

export function sha256FingerprintFromDer(der: Buffer): string {
  return createHash('sha256').update(der).digest('hex');
}
