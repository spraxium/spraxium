/** Numeric semver comparator. Pre-release tags are ignored intentionally. */
export class VersionComparator {
  /** Returns true if `latest` is strictly greater than `current`. */
  static isNewer(latest: string, current: string): boolean {
    const [lMaj, lMin, lPatch] = VersionComparator.parse(latest);
    const [cMaj, cMin, cPatch] = VersionComparator.parse(current);

    if (lMaj !== cMaj) return lMaj > cMaj;
    if (lMin !== cMin) return lMin > cMin;
    return lPatch > cPatch;
  }

  private static parse(version: string): [number, number, number] {
    const [maj = 0, min = 0, patch = 0] = version.split('.').map(Number);
    return [maj, min, patch];
  }
}
