/**
 * Replaces `{{key}}` placeholders in `template` with values from `vars`.
 * Missing keys are passed through as `{{key}}` (never throws, never silently
 * erases data). This matches the i18n `LocaleInterpolator` behavior and makes
 * missing substitutions visible instead of silently producing empty strings.
 *
 * Security note: values are inserted as-is. Do not pass user-controlled
 * content as template keys.
 */
export function interpolateTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => vars[key] ?? match);
}
