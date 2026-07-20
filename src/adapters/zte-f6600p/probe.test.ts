import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { F6600pAdapter } from './F6600pAdapter';
import { scoreF6600pRootHtml } from './probe';
import { FixtureTransport } from '../../services/transport/fixtureTransport';

const rootFixture = readFileSync(
  join(process.cwd(), 'fixtures/zte-f6600p/root-page.html'),
  'utf8',
);

describe('scoreF6600pRootHtml', () => {
  it('scores the sanitized root fixture as compatible', () => {
    const scored = scoreF6600pRootHtml(rootFixture);
    expect(scored.compatible).toBe(true);
    expect(scored.confidence).toBe('high');
    expect(scored.matched).toContain('title-f6600p');
    expect(scored.matched).toContain('frm-username');
  });

  it('rejects unrelated HTML', () => {
    const scored = scoreF6600pRootHtml('<html><title>Other</title></html>');
    expect(scored.compatible).toBe(false);
    expect(scored.matched).toHaveLength(0);
  });
});

describe('F6600pAdapter.probe with FixtureTransport', () => {
  it('probes via fixture transport without network', async () => {
    const transport = new FixtureTransport([
      { match: '/', bodyText: rootFixture },
    ]);
    const adapter = new F6600pAdapter();
    const result = await adapter.probe({
      target: '192.168.1.1',
      protocol: 'http',
      transport,
    });

    expect(result.compatible).toBe(true);
    expect(result.confidence).toBe('high');
    expect(result.evidence.some((e) => e.includes('title-f6600p'))).toBe(true);
  });
});
