import { ANSI } from '@spraxium/logger';
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
    console.log(`  ${ANSI.cyan(UnicodeConstant.INFO)}  ${message}`);
  }

  success(message: string): void {
    console.log(`  ${ANSI.green(UnicodeConstant.CHECK)}  ${ANSI.green(message)}`);
  }

  error(message: string): void {
    console.error(`  ${ANSI.red(UnicodeConstant.CROSS)}  ${ANSI.red(message)}`);
  }

  warn(message: string): void {
    console.log(`  ${ANSI.yellow(UnicodeConstant.WARN)}  ${ANSI.yellow(message)}`);
  }

  star(message: string): void {
    console.log(`  ${ANSI.yellow(UnicodeConstant.STAR)}  ${ANSI.yellow(message)}`);
  }

  blank(): void {
    console.log();
  }

  step(text: string): void {
    process.stdout.write(`  ${ANSI.dim(UnicodeConstant.CIRCLE)}  ${ANSI.dim(text)}\r`);
  }

  result(ok: boolean, text: string): void {
    const icon = ok ? ANSI.green(UnicodeConstant.CHECK) : ANSI.red(UnicodeConstant.CROSS);
    const msg = ok ? ANSI.green(text) : ANSI.red(text);
    console.log(`  ${icon}  ${msg}          `);
  }

  async spinner(label: string, fn: () => Promise<{ ok: boolean; output: string }>): Promise<boolean> {
    let i = 0;
    const timer = setInterval(() => {
      process.stdout.write(
        `  ${ANSI.cyan(SPINNER_FRAMES[i++ % SPINNER_FRAMES.length] ?? '|')}  ${ANSI.dim(label)}\r`,
      );
    }, 80);
    const { ok, output } = await fn();
    clearInterval(timer);
    if (!ok && output) {
      console.log();
      console.log(ANSI.dim('\u2500'.repeat(60)));
      console.log(ANSI.dim(output));
      console.log(ANSI.dim('\u2500'.repeat(60)));
      console.log();
    }
    return ok;
  }
}
