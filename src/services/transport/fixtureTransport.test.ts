import { describe, expect, it } from 'vitest';
import { FixtureTransport } from './fixtureTransport';
import { TransportError } from './types';

describe('FixtureTransport', () => {
  it('returns matched fixture bodies', async () => {
    const transport = new FixtureTransport([
      { match: '/', bodyText: '<html>ok</html>' },
    ]);
    const res = await transport.request({ url: 'http://192.168.1.1/' });
    expect(res.status).toBe(200);
    expect(res.bodyText).toContain('ok');
  });

  it('throws when no route matches', async () => {
    const transport = new FixtureTransport([]);
    await expect(transport.request({ url: 'http://192.168.1.1/missing' })).rejects.toBeInstanceOf(
      TransportError,
    );
  });
});
