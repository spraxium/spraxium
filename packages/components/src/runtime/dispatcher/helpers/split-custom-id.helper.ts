/**
 * Splits a Discord custom ID into its base identifier and tagged suffixes.
 *
 * Format: `baseId[~ctx:<id>][~p:<id>]` (any order). Tags are independent and
 * may appear in either order. A bare unprefixed suffix (e.g. `baseId~<uuid>`)
 * is treated as a legacy `contextId` for backward compatibility with custom
 * IDs minted by earlier versions of the framework.
 *
 * Examples:
 * - `confirm` → `{ baseId: 'confirm' }`
 * - `confirm~ctx:abc` → `{ baseId: 'confirm', contextId: 'abc' }`
 * - `book~p:xyz` → `{ baseId: 'book', payloadId: 'xyz' }`
 * - `book~ctx:abc~p:xyz` → `{ baseId: 'book', contextId: 'abc', payloadId: 'xyz' }`
 * - `book~xyz` (legacy) → `{ baseId: 'book', contextId: 'xyz' }`
 */
export function splitCustomId(fullId: string): {
  baseId: string;
  contextId: string | undefined;
  payloadId: string | undefined;
} {
  const parts = fullId.split('~');
  const baseId = parts[0];
  let contextId: string | undefined;
  let payloadId: string | undefined;
  let legacyTail: string | undefined;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('ctx:')) {
      contextId = part.slice(4);
    } else if (part.startsWith('p:')) {
      payloadId = part.slice(2);
    } else {
      legacyTail = part;
    }
  }

  if (legacyTail && contextId === undefined && payloadId === undefined) {
    contextId = legacyTail;
  }

  return { baseId, contextId, payloadId };
}

/**
 * Joins a base custom ID with optional context/payload suffixes.
 */
export function joinCustomId(baseId: string, opts: { contextId?: string; payloadId?: string } = {}): string {
  let id = baseId;
  if (opts.contextId) id += `~ctx:${opts.contextId}`;
  if (opts.payloadId) id += `~p:${opts.payloadId}`;
  return id;
}
