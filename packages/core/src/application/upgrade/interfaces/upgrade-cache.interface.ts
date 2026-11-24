import type { ReleaseTags } from './release-tags.interface';

export interface UpgradeCache {
  schema: 2;
  checkedAt: number;
  packages: Record<string, ReleaseTags>;
}
