import { ANSI } from '@spraxium/logger';
import { ProcessInspector } from './inspector/process.inspector';
import { LockConflictPrinter } from './printer/lock-conflict.printer';
import { LockStore } from './store/lock.store';

export class ProcessLock {
  private static readonly FORCE_FLAG = '--force-unlock';
  private static readonly SKIP_FLAG = '--no-lock';

  static async acquire(): Promise<void> {
    if (ProcessLock.shouldSkip()) {
      console.log(
        ANSI.yellow('  Lock check skipped (--no-lock). Concurrent instances will not be detected.'),
      );
      console.log('');
      return;
    }

    const existing = LockStore.read();

    if (existing) {
      if (ProcessInspector.isRunning(existing.pid)) {
        if (ProcessLock.shouldForce()) {
          await ProcessLock.forceTakeover(existing);
        } else {
          LockConflictPrinter.print(existing);
          process.exit(1);
        }
      } else {
        LockStore.remove();
      }
    }

    LockStore.write({
      pid: process.pid,
      startedAt: new Date().toISOString(),
      launcherPid: ProcessLock.readLauncherPid(),
    });

    ProcessLock.registerCleanup();
  }

  static release(): void {
    LockStore.remove();
  }

  private static shouldForce(): boolean {
    if (process.env.SPRAXIUM_FORCE_UNLOCK === '1') return true;
    return process.argv.includes(ProcessLock.FORCE_FLAG);
  }

  private static shouldSkip(): boolean {
    if (process.env.SPRAXIUM_NO_LOCK === '1') return true;
    return process.argv.includes(ProcessLock.SKIP_FLAG);
  }

  private static readLauncherPid(): number | undefined {
    const raw = process.env.SPRAXIUM_LAUNCHER_PID;
    if (!raw) return undefined;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private static async forceTakeover(existing: { pid: number; launcherPid?: number }): Promise<void> {
    console.log('');
    console.log(ANSI.yellow(`  Terminating existing instance (bot PID ${existing.pid})...`));

    // The launcher (dev/start CLI) must die first, otherwise it will respawn the bot child.
    const ownLauncher = ProcessLock.readLauncherPid();
    const targetLauncher = existing.launcherPid;

    if (
      typeof targetLauncher === 'number' &&
      targetLauncher !== ownLauncher &&
      ProcessInspector.isRunning(targetLauncher)
    ) {
      console.log(ANSI.yellow(`  Terminating its launcher (PID ${targetLauncher}) to prevent respawn...`));
      await ProcessInspector.terminateAndWait(targetLauncher, 2000);
    }

    if (ProcessInspector.isRunning(existing.pid)) {
      const ok = await ProcessInspector.terminateAndWait(existing.pid, 2000);
      if (!ok) {
        console.log(ANSI.red(`  Failed to terminate PID ${existing.pid}. Aborting.`));
        process.exit(1);
      }
    }

    LockStore.remove();
    console.log(ANSI.green('  Previous instance terminated. Continuing startup.'));
    console.log('');
  }

  private static registerCleanup(): void {
    const release = (): void => LockStore.remove();
    process.once('exit', release);
    process.once('SIGINT', release);
    process.once('SIGTERM', release);
    process.once('uncaughtException', release);
  }
}
