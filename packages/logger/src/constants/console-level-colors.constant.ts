import { ANSI } from './ansi.constant';

/** Default color functions for each built-in log level. */
export const CONSOLE_LEVEL_COLORS: Record<string, (t: string) => string> = {
  INFO: ANSI.cyan,
  SUCCESS: ANSI.green,
  WARN: ANSI.yellow,
  ERROR: ANSI.red,
  DEBUG: ANSI.gray,
  COMMAND: ANSI.magentaBright,
};
