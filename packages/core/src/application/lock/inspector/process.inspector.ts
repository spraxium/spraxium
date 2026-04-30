export class ProcessInspector {
  static isRunning(pid: number): boolean {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  static terminate(pid: number, signal: NodeJS.Signals = 'SIGTERM'): boolean {
    try {
      process.kill(pid, signal);
      return true;
    } catch {
      return false;
    }
  }

  static async terminateAndWait(pid: number, timeoutMs = 1500): Promise<boolean> {
    if (!ProcessInspector.isRunning(pid)) return true;
    ProcessInspector.terminate(pid, 'SIGTERM');

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (!ProcessInspector.isRunning(pid)) return true;
      await new Promise((r) => setTimeout(r, 50));
    }

    ProcessInspector.terminate(pid, 'SIGKILL');
    await new Promise((r) => setTimeout(r, 100));
    return !ProcessInspector.isRunning(pid);
  }
}
