import chalk from 'chalk';
import { UnicodeConstant } from '../constants';

export class CliLogger {
  info(message: string): void {
    console.log(`  ${chalk.cyan(UnicodeConstant.INFO)}  ${message}`);
  }

  success(message: string): void {
    console.log(`  ${chalk.green(UnicodeConstant.CHECK)}  ${chalk.green(message)}`);
  }

  error(message: string): void {
    console.error(`  ${chalk.red(UnicodeConstant.CROSS)}  ${chalk.red(message)}`);
  }

  warn(message: string): void {
    console.log(`  ${chalk.yellow(UnicodeConstant.WARN)}  ${chalk.yellow(message)}`);
  }

  star(message: string): void {
    console.log(`  ${chalk.yellow(UnicodeConstant.STAR)}  ${chalk.yellow(message)}`);
  }

  blank(): void {
    console.log();
  }
}
