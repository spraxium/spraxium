/** Resolves a hex number or hex string to a numeric color value. */
export function resolveAccentColor(color: number | string | undefined): number | undefined {
  if (color === undefined) return undefined;
  if (typeof color === 'number') return color;
  return Number.parseInt(color.replace(/^#/, ''), 16);
}
