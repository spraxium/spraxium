import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { STORAGE_DEFAULTS } from '../constants/defaults.constant';
import { StorageError } from '../errors/storage.error';
import type { StorageParser } from '../types/storage-parser.type';

interface PreparedValue<T> {
  value: T;
  serialized: string;
}

export class AtomicJsonFile<T> {
  private state?: T;
  private initialized = false;
  private initializePromise?: Promise<void>;
  private operationQueue: Promise<void> = Promise.resolve();
  private temporarySequence = 0;

  constructor(
    readonly name: string,
    readonly filePath: string,
    private readonly createDefaults: () => T,
    private readonly parse: StorageParser<T>,
  ) {}

  async initialize(): Promise<void> {
    this.initializePromise ??= this.loadOrCreate();
    await this.initializePromise;
  }

  async read(): Promise<T> {
    this.assertInitialized('read');
    await this.operationQueue;
    return structuredClone(this.getState());
  }

  async replace(value: T): Promise<void> {
    this.assertInitialized('write');
    await this.enqueue(async () => {
      const prepared = this.prepare(value);
      await this.persist(prepared.serialized);
      this.state = prepared.value;
    });
  }

  async mutate<R>(mutator: (draft: T) => R | Promise<R>): Promise<R> {
    this.assertInitialized('write');
    return this.enqueue(async () => {
      const draft = structuredClone(this.getState());
      const result = await mutator(draft);
      const prepared = this.prepare(draft);
      await this.persist(prepared.serialized);
      this.state = prepared.value;
      return result;
    });
  }

  async reset(): Promise<void> {
    this.assertInitialized('write');
    await this.enqueue(async () => {
      const prepared = this.prepareDefaults();
      await this.persist(prepared.serialized);
      this.state = prepared.value;
    });
  }

  async drain(): Promise<void> {
    await this.operationQueue;
  }

  private async loadOrCreate(): Promise<void> {
    let raw: string;
    try {
      raw = await readFile(this.filePath, 'utf8');
    } catch (error) {
      if (!AtomicJsonFile.isEnoent(error)) {
        throw this.error('initialize', `Could not read storage file for "${this.name}".`, error);
      }

      const prepared = this.prepareDefaults();
      await this.persist(prepared.serialized);
      this.state = prepared.value;
      this.initialized = true;
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch (error) {
      throw this.error('validate', `Storage file for "${this.name}" contains invalid JSON.`, error);
    }

    this.state = this.normalize(
      parsed,
      `Storage file for "${this.name}" does not match its declared schema.`,
    ).value;
    this.initialized = true;
  }

  private prepareDefaults(): PreparedValue<T> {
    let defaults: T;
    try {
      defaults = this.createDefaults();
    } catch (error) {
      throw this.error('initialize', `Default factory for "${this.name}" failed.`, error);
    }
    return this.prepare(defaults);
  }

  private prepare(value: T): PreparedValue<T> {
    let normalized: unknown;

    try {
      const serialized = JSON.stringify(value);
      if (serialized === undefined) throw new TypeError('JSON.stringify returned undefined');
      normalized = JSON.parse(serialized) as unknown;
    } catch (error) {
      throw this.error('validate', `Value for "${this.name}" is not JSON serializable.`, error);
    }

    return this.normalize(normalized, `Value for "${this.name}" does not match its declared schema.`);
  }

  private normalize(value: unknown, invalidMessage: string): PreparedValue<T> {
    let parsed: T;
    try {
      parsed = this.parse(value);
    } catch (error) {
      throw this.error('validate', invalidMessage, error);
    }

    let serialized: string | undefined;
    let persistedValue: unknown;
    try {
      serialized = JSON.stringify(parsed, null, STORAGE_DEFAULTS.JSON_INDENT);
      if (serialized === undefined) throw new TypeError('JSON.stringify returned undefined');
      persistedValue = JSON.parse(serialized) as unknown;
    } catch (error) {
      throw this.error('validate', `Value for "${this.name}" is not JSON serializable.`, error);
    }

    let stableValue: T;
    try {
      stableValue = this.parse(persistedValue);
    } catch (error) {
      throw this.error(
        'validate',
        `Normalized value for "${this.name}" does not match its declared schema.`,
        error,
      );
    }

    let stableSerialized: string | undefined;
    try {
      stableSerialized = JSON.stringify(stableValue, null, STORAGE_DEFAULTS.JSON_INDENT);
      if (stableSerialized === undefined) throw new TypeError('JSON.stringify returned undefined');
    } catch (error) {
      throw this.error('validate', `Value for "${this.name}" is not JSON serializable.`, error);
    }

    if (stableSerialized !== serialized) {
      throw this.error(
        'validate',
        `Schema normalization for "${this.name}" must be stable after a JSON round trip.`,
      );
    }

    return { value: stableValue, serialized: `${serialized}\n` };
  }

  private async persist(contents: string): Promise<void> {
    const directory = dirname(this.filePath);
    const temporaryPath = `${this.filePath}.${process.pid}.${Date.now()}.${++this.temporarySequence}.tmp`;

    try {
      await mkdir(directory, { recursive: true });
      await writeFile(temporaryPath, contents, 'utf8');
      await this.renameWithRetry(temporaryPath);
    } catch (error) {
      throw this.error('write', `Could not persist storage file for "${this.name}".`, error);
    } finally {
      await rm(temporaryPath, { force: true }).catch(() => undefined);
    }
  }

  private async renameWithRetry(temporaryPath: string): Promise<void> {
    const maximumAttempts = 5;

    for (let attempt = 1; attempt <= maximumAttempts; attempt++) {
      try {
        await rename(temporaryPath, this.filePath);
        return;
      } catch (error) {
        if (!AtomicJsonFile.isTransientRenameError(error) || attempt === maximumAttempts) throw error;
        await delay(attempt * 10);
      }
    }
  }

  private enqueue<R>(operation: () => Promise<R>): Promise<R> {
    const pending = this.operationQueue.then(operation, operation);
    this.operationQueue = pending.then(
      () => undefined,
      () => undefined,
    );
    return pending;
  }

  private assertInitialized(operation: 'read' | 'write'): void {
    if (this.initialized) return;
    throw this.error(
      operation,
      `Storage "${this.name}" was used before StorageModule completed its boot lifecycle.`,
    );
  }

  private getState(): T {
    if (this.state === undefined) {
      throw this.error('read', `Storage "${this.name}" has no initialized state.`);
    }
    return this.state;
  }

  private error(operation: 'initialize' | 'read' | 'write' | 'validate', message: string, cause?: unknown) {
    return new StorageError(message, {
      operation,
      storeName: this.name,
      filePath: this.filePath,
      cause,
    });
  }

  private static isEnoent(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    );
  }

  private static isTransientRenameError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null || !('code' in error)) return false;
    const code = (error as NodeJS.ErrnoException).code;
    return code === 'EACCES' || code === 'EBUSY' || code === 'EPERM';
  }
}
