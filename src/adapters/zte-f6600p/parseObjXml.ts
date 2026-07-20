/**
 * Generic ZTE-style ajax_response_xml_root / OBJ_* parser.
 * No network I/O. Fixtures only until transport exists.
 */

export type SessionBodyState = 'valid' | 'timeout' | 'unknown';

export interface ParsedAjaxResponse {
  success: boolean;
  errorId?: string;
  errorStr?: string;
  sessionState: SessionBodyState;
  /** Object name → list of Instance parameter maps (string values as observed). */
  objects: Record<string, Array<Record<string, string>>>;
}

const OBJ_BLOCK_RE = /<(OBJ_[A-Z0-9_]+)>([\s\S]*?)<\/\1>/gi;
const INSTANCE_RE = /<Instance>([\s\S]*?)<\/Instance>/gi;
const PARA_RE =
  /<ParaName>\s*([^<]*?)\s*<\/ParaName>\s*<ParaValue>\s*([^<]*?)\s*<\/ParaValue>/gi;

export function classifySessionBody(xml: string): SessionBodyState {
  if (/SessionTimeout/i.test(xml) || /session\s*time\s*out/i.test(xml)) {
    return 'timeout';
  }
  if (/ajax_response_xml_root|OBJ_|IF_ERRORID/i.test(xml)) {
    return 'valid';
  }
  return 'unknown';
}

function extractTag(xml: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}>\\s*([^<]*)\\s*</${tag}>`, 'i');
  const m = re.exec(xml);
  return m?.[1]?.trim();
}

function parseInstance(instanceXml: string): Record<string, string> {
  const params: Record<string, string> = {};
  PARA_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PARA_RE.exec(instanceXml)) !== null) {
    const name = m[1]?.trim() ?? '';
    const value = m[2]?.trim() ?? '';
    if (!name) continue;
    // First wins on duplicate ParaName (observed quirk); keep observed string.
    if (!(name in params)) {
      params[name] = value;
    }
  }
  return params;
}

/**
 * Parse a ZTE ajax XML envelope into object/instance maps.
 * Empty OBJ_* nodes contribute nothing. Malformed input returns success=false.
 */
export function parseAjaxResponseXml(xml: string): ParsedAjaxResponse {
  const trimmed = xml?.trim() ?? '';
  const sessionState = classifySessionBody(trimmed);

  if (!trimmed) {
    return { success: false, sessionState: 'unknown', objects: {} };
  }

  if (sessionState === 'timeout') {
    return {
      success: false,
      errorStr: 'SessionTimeout',
      sessionState,
      objects: {},
    };
  }

  if (!/ajax_response_xml_root/i.test(trimmed) && !/OBJ_/i.test(trimmed)) {
    return { success: false, sessionState, objects: {} };
  }

  const errorId = extractTag(trimmed, 'IF_ERRORID');
  const errorStr = extractTag(trimmed, 'IF_ERRORSTR');
  const objects: Record<string, Array<Record<string, string>>> = {};

  OBJ_BLOCK_RE.lastIndex = 0;
  let objMatch: RegExpExecArray | null;
  while ((objMatch = OBJ_BLOCK_RE.exec(trimmed)) !== null) {
    const objName = objMatch[1];
    const body = objMatch[2] ?? '';
    if (!objName || !body.trim()) {
      continue;
    }

    INSTANCE_RE.lastIndex = 0;
    let instMatch: RegExpExecArray | null;
    let foundInstance = false;
    while ((instMatch = INSTANCE_RE.exec(body)) !== null) {
      foundInstance = true;
      const instance = parseInstance(instMatch[1] ?? '');
      if (Object.keys(instance).length === 0) continue;
      objects[objName] ??= [];
      objects[objName].push(instance);
    }

    // Rare: parameters directly under OBJ without Instance wrapper
    if (!foundInstance) {
      const direct = parseInstance(body);
      if (Object.keys(direct).length > 0) {
        objects[objName] ??= [];
        objects[objName].push(direct);
      }
    }
  }

  const success =
    errorId === undefined || errorId === '0' || /^succ$/i.test(errorStr ?? '');

  const result: ParsedAjaxResponse = {
    success,
    sessionState,
    objects,
  };
  if (errorId !== undefined) result.errorId = errorId;
  if (errorStr !== undefined) result.errorStr = errorStr;
  return result;
}
