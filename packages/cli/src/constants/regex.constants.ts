export const RegexConstant = {
  /** Matches any glob special character: * ? { } [ ] ! */
  GLOB_CHARS: /[*?{}\[\]!]/,

  /** Captures relative import/export specifiers emitted by tsc (from '...' or from "...") */
  ESM_IMPORT_SPECIFIER: /(from\s+|import\s*\()(['"])(\.{1,2}\/[^'"]+)\2/g,

  /** Tests whether a specifier already has a JS-family extension */
  HAS_JS_EXTENSION: /\.(js|mjs|cjs|json)$/,

  /** Matches platform newlines */
  NEWLINE: /\r?\n/,
} as const;
