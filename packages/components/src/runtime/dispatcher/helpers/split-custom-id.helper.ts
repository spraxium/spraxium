/**
 * Splits a Discord custom ID into its base identifier and optional context suffix.
 * The context portion (after the last `~`) carries the flow context ID used
 * for multi-step interactions.
 */
export function splitCustomId(fullId: string): { baseId: string; contextId: string | undefined } {
  const idx = fullId.lastIndexOf('~');
  if (idx === -1) return { baseId: fullId, contextId: undefined };
  const contextId = fullId.slice(idx + 1) || undefined;
  return { baseId: fullId.slice(0, idx), contextId };
}
