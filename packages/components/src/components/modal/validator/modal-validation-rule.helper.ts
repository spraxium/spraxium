import type { ModalValidationRule } from '../interfaces';

/**
 * Fails when the trimmed value has fewer than `min` whitespace-separated words.
 * Empty values are skipped.
 */
export function minWords(min: number, message?: string): ModalValidationRule {
  return {
    validate: (v) => {
      const t = v.trim();
      if (t.length === 0) return true;
      const count = t.split(/\s+/).filter(Boolean).length;
      return count >= min ? true : (message ?? `Must contain at least ${min} word${min === 1 ? '' : 's'}.`);
    },
  };
}

/**
 * Fails when the trimmed value does not match the provided regular expression.
 * Empty values are skipped.
 */
export function matchesPattern(pattern: RegExp, message: string): ModalValidationRule {
  return {
    validate: (v) => {
      const t = v.trim();
      return t.length === 0 || pattern.test(t) ? true : message;
    },
  };
}

/**
 * Fails when the value is non-empty and not a valid e-mail address.
 */
export function emailFormat(message = 'Must be a valid e-mail address.'): ModalValidationRule {
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return {
    validate: (v) => {
      const t = v.trim();
      return t.length === 0 || emailRx.test(t) ? true : message;
    },
  };
}

/**
 * Fails when the value is non-empty and not a valid URL.
 */
export function urlFormat(message = 'Must be a valid URL.'): ModalValidationRule {
  return {
    validate: (v) => {
      const t = v.trim();
      if (t.length === 0) return true;
      try {
        new URL(t);
        return true;
      } catch {
        return message;
      }
    },
  };
}

/**
 * Fails when the value is non-empty and cannot be parsed as a number.
 */
export function isNumeric(message = 'Must be a number.'): ModalValidationRule {
  return {
    validate: (v) => {
      const t = v.trim();
      return t.length === 0 || !Number.isNaN(Number(t)) ? true : message;
    },
  };
}
