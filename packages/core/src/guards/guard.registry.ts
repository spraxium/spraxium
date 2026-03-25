import type { GuardEntry, SpraxiumGuard } from '@spraxium/common';

export class GuardRegistry {
  private static entries: Array<GuardEntry> = [];

  public static register(guardClass: new () => SpraxiumGuard, options: Record<string, unknown> = {}): void {
    GuardRegistry.entries.push({ guard: guardClass, options });
  }

  public static getAll(): Array<GuardEntry> {
    return [...GuardRegistry.entries];
  }

  public static clear(): void {
    GuardRegistry.entries = [];
  }
}
