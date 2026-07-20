import { describe, expect, it } from 'vitest';
import {
  isPrivateOrLocalIpv4,
  LocalTargetError,
  resolveLocalRouterUrl,
} from './localTarget';

describe('isPrivateOrLocalIpv4', () => {
  it('accepts RFC1918 and loopback', () => {
    expect(isPrivateOrLocalIpv4('192.168.1.1')).toBe(true);
    expect(isPrivateOrLocalIpv4('10.0.0.1')).toBe(true);
    expect(isPrivateOrLocalIpv4('172.16.0.1')).toBe(true);
    expect(isPrivateOrLocalIpv4('127.0.0.1')).toBe(true);
  });

  it('rejects public addresses', () => {
    expect(isPrivateOrLocalIpv4('8.8.8.8')).toBe(false);
    expect(isPrivateOrLocalIpv4('1.1.1.1')).toBe(false);
  });
});

describe('resolveLocalRouterUrl', () => {
  it('builds a local http URL', () => {
    const url = resolveLocalRouterUrl({ target: '192.168.1.1', protocol: 'http' });
    expect(url.toString()).toBe('http://192.168.1.1/');
  });

  it('rejects public IPs', () => {
    expect(() => resolveLocalRouterUrl({ target: '8.8.8.8', protocol: 'http' })).toThrow(
      LocalTargetError,
    );
  });

  it('rejects hostnames', () => {
    expect(() =>
      resolveLocalRouterUrl({ target: 'router.local', protocol: 'http' }),
    ).toThrow(LocalTargetError);
  });
});
