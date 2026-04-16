import chalk from 'chalk';
import { UnicodeConstant } from '../constants';

const SPINNER_FRAMES = [
  '\u280B',
  '\u2819',
  '\u2839',
  '\u2838',
  '\u283C',
  '\u2834',
  '\u2826',
  '\u2827',
  '\u2807',
  '\u280F',
];

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

  step(text: string): void {
    process.stdout.write(`  ${chalk.dim(UnicodeConstant.CIRCLE)}  ${chalk.dim(text)}\r`);
  }

  result(ok: boolean, text: string): void {
    const icon = ok ? chalk.green(UnicodeConstant.CHECK) : chalk.red(UnicodeConstant.CROSS);
    const msg = ok ? chalk.green(text) : chalk.red(text);
    console.log(`  ${icon}  ${msg}          `);
  }

  async spinner(label: string, fn: () => Promise<{ ok: boolean; output: string }>): Promise<boolean> {
    let i = 0;
    const timer = setInterval(() => {
      process.stdout.write(
        `  ${chalk.cyan(SPINNER_FRAMES[i++ % SPINNER_FRAMES.length] ?? '|')}  ${chalk.dim(label)}\r`,
      );
    }, 80);
    const { ok, output } = await fn();
    clearInterval(timer);
    if (!ok && output) {
      console.log();
      console.log(chalk.dim('\u2500'.repeat(60)));
      console.log(chalk.dim(output));
      console.log(chalk.dim('\u2500'.repeat(60)));
      console.log();
    }
    return ok;
  }
}
