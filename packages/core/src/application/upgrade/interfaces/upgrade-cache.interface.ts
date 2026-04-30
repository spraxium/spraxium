/** Persisted snapshot of the latest known versions for each tracked package. */
export interface UpgradeCache {
  /** Unix timestamp (ms) when the snapshot was written. */
  checkedAt: number;
  /** Latest version per package name, as returned by the registry. */
  packages: Record<string, string>;
}
