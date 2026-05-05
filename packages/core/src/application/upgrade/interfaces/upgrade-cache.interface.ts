export interface UpgradeCache {
  checkedAt: number;
  packages: Record<string, string>;
}
