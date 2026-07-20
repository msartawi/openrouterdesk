import type { AdapterProbeResult, Confidence } from '../../shared/contracts';
import { resolveLocalRouterUrl } from '../../services/transport/localTarget';
import type { HttpTransport } from '../../services/transport/types';
import type { RouterConnectionContext } from '../core/RouterAdapter';

/** Observable root-page markers for ZTE F6600P family GUIs (from authorized captures). */
export const F6600P_PROBE_SIGNATURES: ReadonlyArray<{ id: string; pattern: RegExp }> = [
  { id: 'title-f6600p', pattern: /<title>\s*F6600P\s*<\/title>/i },
  { id: 'frm-username', pattern: /id\s*=\s*["']Frm_Username["']/i },
  { id: 'frm-password', pattern: /id\s*=\s*["']Frm_Password["']/i },
  { id: 'login-button', pattern: /id\s*=\s*["']LoginId["']/i },
  { id: 'login-data-type', pattern: /_type\s*=\s*loginData|login_token|login_entry/i },
  { id: 'zte-or-vendor', pattern: /\bZTE\b|ZXHN|zte\.com/i },
];

export function scoreF6600pRootHtml(html: string): {
  matched: string[];
  confidence: Confidence;
  compatible: boolean;
} {
  const matched = F6600P_PROBE_SIGNATURES.filter((s) => s.pattern.test(html)).map((s) => s.id);
  const count = matched.length;
  if (count >= 4) {
    return { matched, confidence: 'high', compatible: true };
  }
  if (count >= 2) {
    return { matched, confidence: 'medium', compatible: true };
  }
  if (count === 1) {
    return { matched, confidence: 'low', compatible: false };
  }
  return { matched, confidence: 'low', compatible: false };
}

export async function probeF6600pRootPage(
  context: RouterConnectionContext,
  transport: HttpTransport,
): Promise<AdapterProbeResult> {
  const url = resolveLocalRouterUrl({
    target: context.target,
    protocol: context.protocol,
    path: '/',
  });

  const response = await transport.request({
    url: url.toString(),
    method: 'GET',
    timeoutMs: 10_000,
    maxBytes: 1_500_000,
  });

  if (response.status < 200 || response.status >= 400) {
    return {
      adapterId: 'zte-f6600p',
      compatible: false,
      confidence: 'low',
      evidence: [`Root page HTTP status ${response.status}.`],
    };
  }

  const scored = scoreF6600pRootHtml(response.bodyText);
  const evidence = [
    `Fetched ${response.finalUrl} (HTTP ${response.status}).`,
    ...scored.matched.map((id) => `Matched signature: ${id}`),
  ];
  if (scored.matched.length === 0) {
    evidence.push('No F6600P root-page signatures matched.');
  }

  return {
    adapterId: 'zte-f6600p',
    compatible: scored.compatible,
    confidence: scored.confidence,
    evidence,
  };
}
