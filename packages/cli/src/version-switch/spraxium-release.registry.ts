import semver from 'semver';
import type { ProcessRunner } from '../service/process-runner.service';

export class SpraxiumReleaseRegistry {
  constructor(private readonly runner: Pick<ProcessRunner, 'capture'>) {}

  async resolve(target: string, cwd: string): Promise<string> {
    if (target === 'next' || target === 'stable') {
      const tag = target === 'stable' ? 'latest' : 'next';
      const tags = await this.view('@spraxium/core', 'dist-tags', cwd);
      if (!tags || typeof tags !== 'object' || !(tag in tags)) {
        throw new Error(
          `No Spraxium release found on the npm tag "${tag}". Check your registry configuration.`,
        );
      }

      const version: unknown = Reflect.get(tags, tag);
      if (typeof version !== 'string' || semver.valid(version) !== version) {
        throw new Error(`The npm tag "${tag}" does not point to a valid Spraxium version.`);
      }
      if (Boolean(semver.prerelease(version)) !== (tag === 'next')) {
        throw new Error(`The npm tag "${tag}" points to ${version}, which does not match that channel.`);
      }
      return version;
    }

    if (semver.valid(target) === target) return target;
    throw new Error('Choose "next", "stable", or an exact version such as "1.0.0-dev.42".');
  }

  async assertPublished(names: ReadonlyArray<string>, version: string, cwd: string): Promise<void> {
    const checks = await Promise.all(
      names.map(async (name) => ({ name, actual: await this.view(`${name}@${version}`, 'version', cwd) })),
    );
    const missing: Array<string> = [];
    for (const { name, actual } of checks) {
      if (actual !== version) missing.push(name);
    }
    if (missing.length > 0) {
      throw new Error(`Could not verify Spraxium ${version} in the npm registry for ${missing.join(', ')}.`);
    }
  }

  private async view(specifier: string, field: string, cwd: string): Promise<unknown> {
    const result = await this.runner.capture(
      'npm',
      ['view', specifier, field, '--json', '--prefer-online', '--fetch-retries=0', '--fetch-timeout=10000'],
      { cwd, preferLocal: false },
    );
    if (!result.ok) return undefined;

    try {
      return JSON.parse(result.output);
    } catch {
      return undefined;
    }
  }
}
