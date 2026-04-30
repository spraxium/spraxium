/** A single package that has a newer version available on the registry. */
export interface PackageUpgrade {
  name: string;
  current: string;
  latest: string;
}
