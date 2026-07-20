import type { LoopbackVlan } from '../../shared/contracts';
import { parseAjaxResponseXml, type ParsedAjaxResponse } from './parseObjXml';

const OBJECT_NAME = 'OBJ_LOOPBACK_VLAN_ID';

/** Split VidStr ("1" or "1,20,30") into VLAN IDs. Non-numeric tokens skipped. */
export function parseVidStr(vidStr: string | undefined): number[] {
  if (!vidStr?.trim()) return [];
  return vidStr
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => Number.parseInt(part, 10))
    .filter((n) => Number.isFinite(n) && n >= 0);
}

export function normalizeLoopbackVlans(
  parsed: ParsedAjaxResponse,
): LoopbackVlan[] {
  const rows = parsed.objects[OBJECT_NAME] ?? [];
  const out: LoopbackVlan[] = [];

  for (const row of rows) {
    const instId = row._InstID?.trim();
    const portId = row.PortID?.trim();
    if (!instId || !portId) continue;

    const vids = parseVidStr(row.VidStr);
    const countRaw = row.vlanCount?.trim();
    const vlanCount =
      countRaw !== undefined && countRaw !== ''
        ? Number.parseInt(countRaw, 10)
        : vids.length;

    out.push({
      instId,
      portId,
      vlanCount: Number.isFinite(vlanCount) ? vlanCount : vids.length,
      vids,
      source: 'router-reported',
      confidence: 'high',
    });
  }

  return out;
}

/** Parse a raw F6600P loopback VLAN XML body into domain rows. */
export function parseLoopbackVlansXml(xml: string): LoopbackVlan[] {
  return normalizeLoopbackVlans(parseAjaxResponseXml(xml));
}
