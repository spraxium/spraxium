import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UpgradeCacheStore } from '../src/application/upgrade/cache/upgrade-cache.store';
import { UpgradeNoticePrinter } from '../src/application/upgrade/printer/upgrade-notice.printer';
import { NpmRegistryClient } from '../src/application/upgrade/registry/npm-registry.client';
import { UpgradeChecker } from '../src/application/upgrade/upgrade-checker';
import { VersionComparator } from '../src/application/upgrade/version/version.comparator';

describe('Spraxium release selection', () => {
  it.each([
    { current: '0.9.0', tags: { latest: '0.9.0', next: '1.0.0-dev.45' }, expected: null },
    { current: '0.9.0', tags: { latest: '0.9.1', next: '1.0.0-dev.45' }, expected: '0.9.1' },
    { current: '1.0.0-dev.9', tags: { latest: '0.9.0', next: '1.0.0-dev.10' }, expected: '1.0.0-dev.10' },
    { current: '1.0.0-dev.45', tags: { latest: '0.9.0', next: '1.0.0-dev.42' }, expected: null },
    { current: '1.0.0-dev.42', tags: { latest: '0.9.0', next: '1.1.0-dev.1' }, expected: null },
    { current: '1.0.0-dev.42', tags: { latest: '1.0.0', next: '1.0.0-dev.45' }, expected: '1.0.0' },
    { current: '0.9.0', tags: { latest: '1.0.0-dev.45', next: 'invalid' }, expected: null },
  ])('selects $expected for $current and $tags', ({ current, tags, expected }) => {
    expect(VersionComparator.selectUpdate(current, tags)).toBe(expected);
  });
});

describe('startup version notices', () => {
  beforeEach(() => {
    vi.stubEnv('SHARDS', undefined);
    vi.stubEnv('SPRAXIUM_MOCK_VERSION', '1.0.0-dev.42');
    vi.stubEnv('SPRAXIUM_MOCK_LATEST_VERSION', undefined);
    vi.stubEnv('SPRAXIUM_MOCK_NEXT_VERSION', undefined);
    vi.stubEnv('SPRAXIUM_NO_UPGRADE_NOTIFIER', undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('identifies a development build even with update checks disabled', () => {
    vi.stubEnv('SPRAXIUM_NO_UPGRADE_NOTIFIER', '1');
    const preview = vi.spyOn(UpgradeNoticePrinter, 'printPreview').mockImplementation(() => undefined);
    const fetchTags = vi.spyOn(NpmRegistryClient, 'fetchReleaseTags');

    UpgradeChecker.check();

    expect(preview).toHaveBeenCalledExactlyOnceWith('1.0.0-dev.42');
    expect(fetchTags).not.toHaveBeenCalled();
  });

  it('reports the final release from a preview and leaves mock tags out of the cache', async () => {
    vi.stubEnv('SPRAXIUM_MOCK_NEXT_VERSION', '1.0.0-dev.45');
    vi.stubEnv('SPRAXIUM_MOCK_LATEST_VERSION', '1.0.0');
    vi.spyOn(UpgradeNoticePrinter, 'printPreview').mockImplementation(() => undefined);
    const notify = vi.spyOn(UpgradeNoticePrinter, 'print').mockImplementation(() => undefined);
    const cache = vi.spyOn(UpgradeCacheStore, 'read');

    expect(UpgradeChecker.check()).toBeUndefined();

    await vi.waitFor(() =>
      expect(notify).toHaveBeenCalledWith(
        expect.arrayContaining([{ name: '@spraxium/core', current: '1.0.0-dev.42', available: '1.0.0' }]),
      ),
    );
    expect(cache).not.toHaveBeenCalled();
  });

  it('keeps the local development-build notice when the registry is offline', async () => {
    const preview = vi.spyOn(UpgradeNoticePrinter, 'printPreview').mockImplementation(() => undefined);
    const notify = vi.spyOn(UpgradeNoticePrinter, 'print').mockImplementation(() => undefined);
    vi.spyOn(UpgradeCacheStore, 'read').mockResolvedValue(null);
    const request = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', request);

    UpgradeChecker.check();

    expect(preview).toHaveBeenCalledExactlyOnceWith('1.0.0-dev.42');
    await vi.waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        'https://registry.npmjs.org/-/package/%40spraxium%2Fcore/dist-tags',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      ),
    );
    expect(notify).not.toHaveBeenCalled();
  });

  it('leaves version notices to the parent process when running shards', () => {
    vi.stubEnv('SHARDS', '0');
    const preview = vi.spyOn(UpgradeNoticePrinter, 'printPreview');
    const cache = vi.spyOn(UpgradeCacheStore, 'read');

    UpgradeChecker.check();

    expect(preview).not.toHaveBeenCalled();
    expect(cache).not.toHaveBeenCalled();
  });
});
