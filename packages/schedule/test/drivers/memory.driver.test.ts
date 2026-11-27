import { describe, expect, it } from 'vitest';
import { MemoryDriver } from '../../src/drivers/memory.driver';

describe('MemoryDriver', () => {
  it('excludes concurrent owners of the same job while allowing unrelated jobs', async () => {
    const driver = new MemoryDriver();
    expect(await driver.acquireLock('job', 100)).toBe(false);
    await driver.init();
    expect(await driver.acquireLock('job', 100)).toBe(true);
    expect(await driver.acquireLock('job', 100)).toBe(false);
    expect(await driver.acquireLock('other', 100)).toBe(true);
    await driver.releaseLock('job');
    expect(await driver.acquireLock('job', 100)).toBe(true);
    await driver.destroy();
    expect(await driver.acquireLock('job', 100)).toBe(false);
    await driver.init();
    expect(await driver.acquireLock('job', 100)).toBe(true);
    await driver.destroy();
  });
});
