import { afterEach, describe, expect, it, vi } from 'vitest';
import { RedisClientFactory } from '../../src/drivers/redis-client.factory';
import { RedisScheduleDriver } from '../../src/drivers/redis.driver';

function createClient() {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn(),
    set: vi.fn().mockResolvedValue('OK'),
    eval: vi.fn().mockResolvedValue(1),
  };
}

function createDriver(client = createClient()) {
  const factory = new RedisClientFactory();
  vi.spyOn(factory, 'create').mockResolvedValue(client);
  return { driver: new RedisScheduleDriver({ keyPrefix: 'test:' }, factory), factory, client };
}

describe('RedisScheduleDriver', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes one connection when init is called concurrently', async () => {
    const { driver, client, factory } = createDriver();
    await Promise.all([driver.init(), driver.init(), driver.init()]);
    expect(factory.create).toHaveBeenCalledTimes(1);
    expect(client.connect).toHaveBeenCalledTimes(1);
    await driver.destroy();
  });

  it('keeps millisecond precision and generates a different owner token for each acquisition', async () => {
    const { driver, client } = createDriver();
    await driver.init();
    expect(await driver.acquireLock('job', 1501)).toBe(true);
    const token = client.set.mock.calls[0][1];
    expect(client.set).toHaveBeenCalledWith('test:lock:job', token, 'PX', 1501, 'NX');
    expect(await driver.acquireLock('job', 1501)).toBe(false);
    await driver.releaseLock('job');
    expect(client.eval).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('del'"),
      1,
      'test:lock:job',
      token,
    );
    expect(await driver.acquireLock('job', 1501)).toBe(true);
    expect(client.set.mock.calls[1][1]).not.toBe(token);
    await driver.destroy();
  });

  it('renews and releases only a key that still belongs to its acquisition', async () => {
    const values = new Map<string, string>();
    const clientA = createClient();
    const clientB = createClient();
    for (const client of [clientA, clientB]) {
      client.set.mockImplementation(async (key: string, token: string) => {
        if (values.has(key)) return null;
        values.set(key, token);
        return 'OK';
      });
      client.eval.mockImplementation(async (script: string, _count: number, key: string, token: string) => {
        if (values.get(key) !== token) return 0;
        if (script.includes("redis.call('del'")) values.delete(key);
        return 1;
      });
    }
    const { driver: a } = createDriver(clientA);
    const { driver: b } = createDriver(clientB);
    await Promise.all([a.init(), b.init()]);
    expect(await a.acquireLock('shared', 50)).toBe(true);
    expect(await b.acquireLock('shared', 50)).toBe(false);
    values.delete('test:lock:shared');
    expect(await b.acquireLock('shared', 50)).toBe(true);
    const tokenB = values.get('test:lock:shared');
    expect(await a.renewLock('shared', 50)).toBe(false);
    await a.releaseLock('shared');
    expect(values.get('test:lock:shared')).toBe(tokenB);
    expect(await b.renewLock('shared', 50)).toBe(true);
    expect(clientB.eval).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('pexpire'"),
      1,
      'test:lock:shared',
      tokenB,
      50,
    );
    await b.releaseLock('shared');
    expect(values.size).toBe(0);
    await Promise.all([a.destroy(), b.destroy()]);
  });

  it('does not leave a local ownership token after a failed or denied acquisition', async () => {
    const { driver, client } = createDriver();
    await driver.init();
    client.set.mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('offline'));
    expect(await driver.acquireLock('job', 50)).toBe(false);
    await expect(driver.acquireLock('job', 50)).rejects.toThrow('offline');
    expect(await driver.acquireLock('job', 50)).toBe(true);
    await driver.destroy();
  });

  it('cleans up failed connections and permits another initialization attempt', async () => {
    const { driver, client } = createDriver();
    client.connect.mockRejectedValueOnce(new Error('connection failed'));
    await expect(driver.init()).rejects.toThrow('connection failed');
    expect(client.disconnect).toHaveBeenCalledTimes(1);
    expect(await driver.acquireLock('job', 50)).toBe(false);
    await driver.init();
    expect(await driver.acquireLock('job', 50)).toBe(true);
    await driver.destroy();
  });

  it('does not resurrect a connection destroyed while connecting', async () => {
    const { driver, client } = createDriver();
    let finish: () => void = () => {};
    client.connect.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const initialization = driver.init();
    await Promise.resolve();
    await driver.destroy();
    finish();
    await expect(initialization).rejects.toThrow('destroyed during initialization');
    expect(await driver.acquireLock('job', 50)).toBe(false);
    expect(client.disconnect).toHaveBeenCalled();
  });

  it('rejects invalid TTL values and empty Redis prefixes', async () => {
    const { driver } = createDriver();
    await driver.init();
    for (const ttl of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, 0.5])
      await expect(driver.acquireLock('job', ttl)).rejects.toThrow();
    expect(() => new RedisScheduleDriver({ keyPrefix: '' })).toThrow();
    await driver.destroy();
  });

  it('does not issue commands after shutdown', async () => {
    const { driver, client } = createDriver();
    await driver.init();
    await driver.acquireLock('job', 50);
    await driver.destroy();
    client.set.mockClear();
    client.eval.mockClear();
    expect(await driver.acquireLock('job', 50)).toBe(false);
    expect(await driver.renewLock('job', 50)).toBe(false);
    await driver.releaseLock('job');
    expect(client.set).not.toHaveBeenCalled();
    expect(client.eval).not.toHaveBeenCalled();
  });

  it('does not erase a new connection owner when an old connection finishes acquiring late', async () => {
    const oldClient = createClient();
    const newClient = createClient();
    let finish: (value: string) => void = () => {};
    oldClient.set.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          finish = resolve;
        }),
    );
    const factory = new RedisClientFactory();
    vi.spyOn(factory, 'create').mockResolvedValueOnce(oldClient).mockResolvedValueOnce(newClient);
    const driver = new RedisScheduleDriver({}, factory);
    await driver.init();
    const oldAcquisition = driver.acquireLock('job', 100);
    await driver.destroy();
    await driver.init();
    expect(await driver.acquireLock('job', 100)).toBe(true);
    const token = newClient.set.mock.calls[0][1];
    finish('OK');
    expect(await oldAcquisition).toBe(false);
    await driver.releaseLock('job');
    expect(newClient.eval).toHaveBeenCalledWith(expect.any(String), 1, 'spraxium:schedule:lock:job', token);
    await driver.destroy();
  });
});
