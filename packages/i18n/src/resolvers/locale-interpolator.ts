import { I18N_DEFAULTS } from '../constants/i18n-defaults.constant';
import type { InterpolationVars } from '../types/interpolation-vars.type';

/**
 * Handles `{{variable}}` substitution in locale strings.
 * Missing variables are left as-is, never throws on missing keys.
 */
export class LocaleInterpolator {
  static interpolate(template: string, vars: InterpolationVars): string {
    return template.replace(I18N_DEFAULTS.PLACEHOLDER_REGEX, (match, key: string) => {
      return key in vars ? String(vars[key]) : match;
    });
  }
}
