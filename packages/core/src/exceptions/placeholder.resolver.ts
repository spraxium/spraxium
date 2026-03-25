/**
 * Resolves `{{key}}` placeholders in a template string using an exception's props.
 *
 * - Keys are trimmed: `{{ seconds }}` and `{{seconds}}` both work.
 * - Unknown keys are left as-is — never replaced with empty string.
 * - Values are coerced via String() — safe for numbers, booleans, etc.
 * - No eval, no dynamic execution — pure regex replacement.
 *
 * @example
 * resolvePlaceholders('Wait {{seconds}}s before retrying.', { seconds: 10 })
 * // → 'Wait 10s before retrying.'
 *
 * resolvePlaceholders('Field {{field}} is invalid.', {})
 * // → 'Field {{field}} is invalid.'   (unknown key preserved)
 */
export function resolvePlaceholders(template: string, props: Record<string, unknown>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key: string) => {
    const trimmed = key.trim();
    return Object.prototype.hasOwnProperty.call(props, trimmed) ? String(props[trimmed]) : match;
  });
}
