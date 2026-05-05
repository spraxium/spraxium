/**
 * Native ANSI SGR escape sequences — no external dependencies.
 *
 * Usage: `ANSI.cyan('some text')`
 */
export const ANSI = {
  reset: (t: string) => `\x1b[0m${t}\x1b[0m`,
  bold: (t: string) => `\x1b[1m${t}\x1b[0m`,
  dim: (t: string) => `\x1b[2m${t}\x1b[0m`,

  black: (t: string) => `\x1b[30m${t}\x1b[0m`,
  red: (t: string) => `\x1b[31m${t}\x1b[0m`,
  green: (t: string) => `\x1b[32m${t}\x1b[0m`,
  yellow: (t: string) => `\x1b[33m${t}\x1b[0m`,
  blue: (t: string) => `\x1b[34m${t}\x1b[0m`,
  magenta: (t: string) => `\x1b[35m${t}\x1b[0m`,
  cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
  white: (t: string) => `\x1b[37m${t}\x1b[0m`,
  gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
  grey: (t: string) => `\x1b[90m${t}\x1b[0m`,

  redBright: (t: string) => `\x1b[91m${t}\x1b[0m`,
  greenBright: (t: string) => `\x1b[92m${t}\x1b[0m`,
  yellowBright: (t: string) => `\x1b[93m${t}\x1b[0m`,
  blueBright: (t: string) => `\x1b[94m${t}\x1b[0m`,
  magentaBright: (t: string) => `\x1b[95m${t}\x1b[0m`,
  cyanBright: (t: string) => `\x1b[96m${t}\x1b[0m`,
  whiteBright: (t: string) => `\x1b[97m${t}\x1b[0m`,
} as const;

export type AnsiColorName = keyof typeof ANSI;
