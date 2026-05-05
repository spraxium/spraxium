import { type Options, type ResultPromise, execa } from 'execa';

const SAFE_CMD = /^[a-zA-Z0-9._@/\\:-]+$/;

export class ProcessRunner {
  async inherit(cmd: string, args: Array<string> = [], options: Options = {}): Promise<boolean> {
    ProcessRunner.assertSafeCommand(cmd);
    try {
      await execa(cmd, args, { stdio: 'inherit', shell: false, preferLocal: true, ...options });
      return true;
    } catch {
      return false;
    }
  }

  async silent(cmd: string, args: Array<string> = [], options: Options = {}): Promise<boolean> {
    ProcessRunner.assertSafeCommand(cmd);
    try {
      await execa(cmd, args, { stdio: 'pipe', shell: false, preferLocal: true, ...options });
      return true;
    } catch {
      return false;
    }
  }

  async capture(
    cmd: string,
    args: Array<string> = [],
    options: Options = {},
  ): Promise<{ ok: boolean; output: string }> {
    ProcessRunner.assertSafeCommand(cmd);
    try {
      const result = await execa(cmd, args, { stdio: 'pipe', shell: false, preferLocal: true, ...options });
      return { ok: true, output: this.asText(result.stdout) };
    } catch (error: unknown) {
      const output =
        error instanceof Error
          ? this.asText((error as { stderr?: unknown }).stderr ?? error.message)
          : String(error);
      return { ok: false, output };
    }
  }

  private asText(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value == null) return '';
    if (value instanceof Uint8Array) return Buffer.from(value).toString('utf8');
    if (Array.isArray(value)) return value.map((item) => this.asText(item)).join('\n');
    return String(value);
  }

  spawn(cmd: string, args: Array<string> = [], options: Options = {}): ResultPromise {
    ProcessRunner.assertSafeCommand(cmd);
    return execa(cmd, args, { stdio: 'inherit', shell: false, ...options });
  }

  private static assertSafeCommand(cmd: string): void {
    if (!SAFE_CMD.test(cmd)) {
      throw new Error(`Unsafe command name: "${cmd}"`);
    }
  }
}
