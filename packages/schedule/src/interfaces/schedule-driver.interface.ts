export interface ScheduleDriver {
  init(): Promise<void>;
  /**
   * Tries to acquire the execution lock for `jobName`.
   *
   * Resolve to `false` when the lock is held elsewhere. When acquired, resolve
   * to `true` or, preferably, to a string token that uniquely identifies this
   * acquisition. The scheduler passes the token back to {@link releaseLock} so
   * a stale invocation can never release a lease acquired after its own expired.
   */
  acquireLock(jobName: string, ttlMs: number): Promise<boolean | string>;
  /**
   * Releases the lock for `jobName`. `token` is the value returned by
   * {@link acquireLock} when it was a string; drivers should only release a
   * lock still owned by that token.
   */
  releaseLock(jobName: string, token?: string): Promise<void>;
  destroy(): Promise<void>;
}
