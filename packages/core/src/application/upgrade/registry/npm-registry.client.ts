import type { ReleaseTags } from '../interfaces/release-tags.interface';

export class NpmRegistryClient {
  private static readonly TIMEOUT_MS = 3_000;

  private static async fetchTags(packageName: string): Promise<ReleaseTags | null> {
    const url = `https://registry.npmjs.org/-/package/${encodeURIComponent(packageName)}/dist-tags`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(NpmRegistryClient.TIMEOUT_MS),
      headers: { accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null) return null;

    const tags: ReleaseTags = {};
    if ('latest' in data && typeof data.latest === 'string') tags.latest = data.latest;
    if ('next' in data && typeof data.next === 'string') tags.next = data.next;
    return tags.latest || tags.next ? tags : null;
  }

  static async fetchReleaseTags(packages: ReadonlyArray<string>): Promise<Record<string, ReleaseTags>> {
    const results = await Promise.allSettled(
      packages.map(async (name) => [name, await NpmRegistryClient.fetchTags(name)] as const),
    );

    const map: Record<string, ReleaseTags> = {};
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value[1]) {
        map[result.value[0]] = result.value[1];
      }
    }
    return map;
  }
}
