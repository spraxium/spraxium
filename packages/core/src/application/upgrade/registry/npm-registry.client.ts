/**
 * Thin wrapper around the public npm registry. Fetches the `latest` dist-tag
 * for a single package with a configurable timeout.
 */
export class NpmRegistryClient {
  private static readonly TIMEOUT_MS = 3_000;

  static async fetchLatest(packageName: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), NpmRegistryClient.TIMEOUT_MS);

    try {
      const res = await fetch(`https://registry.npmjs.org/${packageName}/latest`, {
        signal: controller.signal,
        headers: { accept: 'application/json' },
      });

      if (!res.ok) return '';

      const data = (await res.json()) as { version?: string };
      return data.version ?? '';
    } finally {
      clearTimeout(timeout);
    }
  }

  static async fetchLatestMany(packages: ReadonlyArray<string>): Promise<Record<string, string>> {
    const results = await Promise.allSettled(
      packages.map(async (name) => [name, await NpmRegistryClient.fetchLatest(name)] as const),
    );

    const map: Record<string, string> = {};
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value[1]) {
        map[result.value[0]] = result.value[1];
      }
    }
    return map;
  }
}
