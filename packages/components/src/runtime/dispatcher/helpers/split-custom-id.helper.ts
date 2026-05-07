/**
 * Splits a Discord custom ID into its base identifier and tagged suffixes.
 *
 * Format: `baseId[~ctx:<id>][~p:<id>][~k=v&x=y]` (any order for tagged segments).
 * A bare unprefixed suffix (e.g. `baseId~<uuid>`) is treated as a legacy
 * `contextId` for backward compatibility with custom IDs minted by earlier
 * versions of the framework.
 *
 * Examples:
 * - `confirm` → `{ baseId: 'confirm' }`
 * - `confirm~ctx:abc` → `{ baseId: 'confirm', contextId: 'abc' }`
 * - `book~p:xyz` → `{ baseId: 'book', payloadId: 'xyz' }`
 * - `book~id=42` → `{ baseId: 'book', inlineParams: 'id=42' }`
 * - `book~ctx:abc~p:xyz` → `{ baseId: 'book', contextId: 'abc', payloadId: 'xyz' }`
 * - `book~xyz` (legacy) → `{ baseId: 'book', contextId: 'xyz' }`
 */
export function splitCustomId(fullId: string): {
  baseId: string;
  contextId: string | undefined;
  payloadId: string | undefined;
  inlineParams: string | undefined;
} {
  const parts = fullId.split('~');
  const baseId = parts[0];
  let contextId: string | undefined;
  let payloadId: string | undefined;
  let inlineParams: string | undefined;
  let legacyTail: string | undefined;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('ctx:')) {
      contextId = part.slice(4);
    } else if (part.startsWith('p:')) {
      payloadId = part.slice(2);
    } else if (part.includes('=') || part.includes('&') || inlineParams !== undefined) {
      inlineParams = inlineParams ? `${inlineParams}~${part}` : part;
    } else {
      legacyTail = part;
    }
  }

  if (legacyTail && contextId === undefined && payloadId === undefined && inlineParams === undefined) {
    contextId = legacyTail;
  }

  return { baseId, contextId, payloadId, inlineParams };
}

/**
 * Joins a base custom ID with optional context/payload/inline-params suffixes.
 *
 * The order of suffixes is stable: `baseId[~ctx:<id>][~p:<id>][~k=v&...]`.
 */
export function joinCustomId(
  baseId: string,
  opts: { contextId?: string; payloadId?: string; inlineParams?: string } = {},
): string {
  let id = baseId;
  if (opts.inlineParams) id += `~${opts.inlineParams}`;
  if (opts.contextId) id += `~ctx:${opts.contextId}`;
  if (opts.payloadId) id += `~p:${opts.payloadId}`;
  return id;
}

export type InlineParamValue = string | number | boolean;

export type InlineParams = Record<string, InlineParamValue>;

function encodeInlinePart(raw: string): string {
  // `~` must be escaped because it is our segment separator.
  return encodeURIComponent(raw).replace(/~/g, '%7E');
}

function coerceInlineValue(raw: string): InlineParamValue {
  if (raw === 'true') return true;
  if (raw === 'false') return false;

  const numeric = Number(raw);
  if (raw.trim() !== '' && Number.isFinite(numeric)) return numeric;

  return raw;
}

/** Encodes inline params into a compact query-string segment used after `baseId~...`. */
export function encodeInlineParams(params: InlineParams | undefined): string | undefined {
  if (!params) return undefined;

  const entries = Object.entries(params);
  if (entries.length === 0) return undefined;

  return entries
    .map(([key, value]) => `${encodeInlinePart(key)}=${encodeInlinePart(String(value))}`)
    .join('&');
}

/** Decodes inline query-string params and applies basic scalar coercion. */
export function decodeInlineParams(raw: string | undefined): InlineParams | undefined {
  if (raw === undefined) return undefined;
  if (raw.length === 0) return {};

  const out: InlineParams = {};
  const parsed = new URLSearchParams(raw);

  for (const [key, value] of parsed.entries()) {
    out[key] = coerceInlineValue(value);
  }

  return out;
}
