/**
 * Replaces `{{key}}` placeholders in `template` with values from `vars`.
 * Missing keys are replaced with an empty string (never throws).
 *
 * Security note: values are inserted as-is. Do not pass user-controlled
 * content as template keys.
 */
export function interpolateTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '');
}
