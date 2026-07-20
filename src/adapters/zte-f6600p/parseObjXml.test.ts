import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseLoopbackVlansXml, parseVidStr } from './loopbackVlan';
import { classifySessionBody, parseAjaxResponseXml } from './parseObjXml';

const fixturePath = join(
  process.cwd(),
  'fixtures/zte-f6600p/obj-loopback-vlan.xml',
);

describe('parseVidStr', () => {
  it('parses single and comma-separated VLAN IDs', () => {
    expect(parseVidStr('1')).toEqual([1]);
    expect(parseVidStr('1,20,30')).toEqual([1, 20, 30]);
    expect(parseVidStr('')).toEqual([]);
    expect(parseVidStr('1,x,2')).toEqual([1, 2]);
  });
});

describe('parseAjaxResponseXml', () => {
  it('parses the sanitized loopback VLAN fixture and skips empty OBJ nodes', () => {
    const xml = readFileSync(fixturePath, 'utf8');
    const parsed = parseAjaxResponseXml(xml);

    expect(parsed.success).toBe(true);
    expect(parsed.sessionState).toBe('valid');
    expect(parsed.errorId).toBe('0');
    expect(parsed.objects.OBJ_LOOPBACK_VLAN_ID).toHaveLength(1);
    expect(parsed.objects.OBJ_LOOPBACK_VLAN_ID[0]).toMatchObject({
      _InstID: 'DEV.LOOP.VLAN1',
      PortID: 'DEV.BRIDGING.BR1.BRPORT5',
      vlanCount: '1',
      VidStr: '1',
    });
  });

  it('detects SessionTimeout bodies with HTTP-style success envelopes', () => {
    const xml = '<ajax_response_xml_root>SessionTimeout</ajax_response_xml_root>';
    const parsed = parseAjaxResponseXml(xml);
    expect(parsed.sessionState).toBe('timeout');
    expect(parsed.success).toBe(false);
    expect(classifySessionBody(xml)).toBe('timeout');
  });

  it('returns empty objects for blank input', () => {
    const parsed = parseAjaxResponseXml('');
    expect(parsed.success).toBe(false);
    expect(parsed.objects).toEqual({});
  });
});

describe('parseLoopbackVlansXml', () => {
  it('normalizes fixture rows into LoopbackVlan domain objects', () => {
    const xml = readFileSync(fixturePath, 'utf8');
    const rows = parseLoopbackVlansXml(xml);

    expect(rows).toEqual([
      {
        instId: 'DEV.LOOP.VLAN1',
        portId: 'DEV.BRIDGING.BR1.BRPORT5',
        vlanCount: 1,
        vids: [1],
        source: 'router-reported',
        confidence: 'high',
      },
    ]);
  });
});
