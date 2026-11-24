import semver from 'semver';
import type { ReleaseTags } from '../interfaces/release-tags.interface';

export class VersionComparator {
  static isPreview(version: string): boolean {
    return semver.prerelease(version) !== null;
  }

  static selectUpdate(current: string, tags: ReleaseTags): string | null {
    const installed = semver.parse(current);
    if (!installed) return null;

    const stable = semver.parse(tags.latest ?? '');
    if (stable && stable.prerelease.length === 0 && semver.gt(stable, installed)) return stable.version;
    if (installed.prerelease.length === 0) return null;

    const preview = semver.parse(tags.next ?? '');
    if (!preview || preview.prerelease.length === 0) return null;
    if (
      preview.major !== installed.major ||
      preview.minor !== installed.minor ||
      preview.patch !== installed.patch
    ) {
      return null;
    }
    return semver.gt(preview, installed) ? preview.version : null;
  }
}
