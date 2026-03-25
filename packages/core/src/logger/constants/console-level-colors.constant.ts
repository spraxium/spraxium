import chalk, { type ChalkInstance } from 'chalk';

export const CONSOLE_LEVEL_COLORS: Record<string, ChalkInstance> = {
  INFO: chalk.cyan,
  SUCCESS: chalk.green,
  WARN: chalk.yellow,
  ERROR: chalk.red,
  DEBUG: chalk.gray,
  COMMAND: chalk.magentaBright,
};
