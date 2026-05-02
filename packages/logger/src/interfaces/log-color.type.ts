/** A named ANSI color key, mapping to an `ANSI.*` function. */
export type LogColor =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'gray'
  | 'white'
  | 'redBright'
  | 'greenBright'
  | 'yellowBright'
  | 'blueBright'
  | 'magentaBright'
  | 'cyanBright'
  | 'whiteBright';

/**
 * Accepted color input for custom log levels.
 * Either a named color string or a raw ANSI escape sequence wrapper function.
 */
export type LogColorInput = LogColor | ((text: string) => string);
