import { type Options, type ResultPromise, execa } from 'execa';

export class ProcessRunner {
  async inherit(cmd: string, args: Array<string> = [], options: Options = {}): Promise<boolean> {
    try {
      await execa(cmd, args, { stdio: 'inherit', ...options });
      return true;
    } catch {
      return false;
    }
  }

  spawn(cmd: string, args: Array<string> = [], options: Options = {}): ResultPromise {
    return execa(cmd, args, { stdio: 'inherit', ...options });
  }
}
