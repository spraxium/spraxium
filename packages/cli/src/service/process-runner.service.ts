import { type Options, type ResultPromise, execa } from 'execa';

export class ProcessRunner {
  async inherit(cmd: string, args: Array<string> = [], options: Options = {}): Promise<boolean> {
    try {
      await execa(cmd, args, { stdio: 'inherit', preferLocal: true, ...options });
      return true;
    } catch {
      return false;
    }
  }

  async silent(cmd: string, args: Array<string> = [], options: Options = {}): Promise<boolean> {
    try {
      await execa(cmd, args, { stdio: 'pipe', preferLocal: true, ...options });
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
    try {
      const result = await execa(cmd, args, { stdio: 'pipe', preferLocal: true, ...options });
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
    return execa(cmd, args, { stdio: 'inherit', ...options });
  }
}
