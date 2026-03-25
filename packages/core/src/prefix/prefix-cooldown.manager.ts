export class PrefixCooldownManager {
  private readonly store = new Map<string, Map<string, number>>();

  public check(commandName: string, userId: string): number {
    const users = this.store.get(commandName);
    if (!users) return 0;

    const expiresAt = users.get(userId);
    if (expiresAt === undefined) return 0;

    const remaining = (expiresAt - Date.now()) / 1000;
    if (remaining <= 0) {
      users.delete(userId);
      if (users.size === 0) this.store.delete(commandName);
      return 0;
    }

    return Math.ceil(remaining);
  }

  public set(commandName: string, userId: string, seconds: number): void {
    if (seconds <= 0) return;

    let users = this.store.get(commandName);
    if (!users) {
      users = new Map();
      this.store.set(commandName, users);
    }

    users.set(userId, Date.now() + seconds * 1000);
  }

  public clear(): void {
    this.store.clear();
  }
}
