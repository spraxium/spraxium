import 'reflect-metadata';
import { join, resolve } from 'node:path';
import { type Constructor, Injectable } from '@spraxium/common';
import { ConfigStore, ModuleLoader } from '@spraxium/core';
import { logger } from '@spraxium/logger';
import { STORAGE_DEFAULTS } from '../constants/defaults.constant';
import { STORAGE_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { CollectionDefinition } from '../definitions/collection-definition';
import type { DocumentDefinition } from '../definitions/document-definition';
import { StorageError } from '../errors/storage.error';
import type { StorageConfig } from '../interfaces/storage-config.interface';
import type { StorageDefinitionMetadata } from '../interfaces/storage-definition-metadata.interface';
import { defineStorage } from '../storage.config';
import { createStorageParser } from '../utils/storage-parser.util';
import { assertStoreName } from '../utils/store-name.util';
import { AtomicJsonFile } from './atomic-json-file';
import { CollectionStore } from './collection.store';
import { DocumentStore } from './document.store';

type AnyDefinition = DocumentDefinition<unknown> | CollectionDefinition<unknown>;

interface RegisteredStore {
  token: Constructor<AnyDefinition>;
  metadata: StorageDefinitionMetadata;
  file: AtomicJsonFile<unknown>;
  handle: DocumentStore<unknown> | CollectionStore<unknown>;
}

@Injectable()
export class StorageRegistry {
  private readonly log = logger.child('StorageRegistry');
  private readonly stores = new Map<Constructor, RegisteredStore>();
  private readonly names = new Map<string, Constructor>();
  private readonly scannerFn: (instance: unknown) => void;
  private readonly config: StorageConfig;
  private booted = false;

  constructor() {
    this.config = ConfigStore.getPluginConfig(defineStorage) ?? {};
    this.scannerFn = this.scan.bind(this);
    ModuleLoader.instanceScanners.add(this.scannerFn);
  }

  document<T>(token: Constructor<DocumentDefinition<T>>): DocumentStore<T> {
    const registered = this.register(token as Constructor<AnyDefinition>);
    if (registered.metadata.kind !== 'document') {
      throw this.definitionError(
        registered.metadata.options.name,
        `Storage definition "${token.name}" is a collection, not a document.`,
      );
    }
    return registered.handle as DocumentStore<T>;
  }

  collection<T>(token: Constructor<CollectionDefinition<T>>): CollectionStore<T> {
    const registered = this.register(token as Constructor<AnyDefinition>);
    if (registered.metadata.kind !== 'collection') {
      throw this.definitionError(
        registered.metadata.options.name,
        `Storage definition "${token.name}" is a document, not a collection.`,
      );
    }
    return registered.handle as CollectionStore<T>;
  }

  async initialize(): Promise<void> {
    if (this.booted) return;
    await Promise.all(Array.from(this.stores.values(), (store) => store.file.initialize()));
    this.booted = true;
    this.log.debug(`Initialized ${this.stores.size} JSON storage store(s)`);
  }

  async shutdown(): Promise<void> {
    ModuleLoader.instanceScanners.delete(this.scannerFn);
    await Promise.all(Array.from(this.stores.values(), (store) => store.file.drain()));
    this.booted = false;
  }

  registered(): Array<string> {
    return Array.from(this.names.keys());
  }

  private scan(instance: unknown): void {
    if (!instance || typeof instance !== 'object') return;
    const token = (instance as { constructor: Constructor<AnyDefinition> }).constructor;
    const metadata = Reflect.getMetadata(STORAGE_METADATA_KEYS.DEFINITION, token) as
      | StorageDefinitionMetadata
      | undefined;
    if (metadata) this.register(token);
  }

  private register(token: Constructor<AnyDefinition>): RegisteredStore {
    const existing = this.stores.get(token);
    if (existing) return existing;

    if (this.booted) {
      throw this.definitionError(
        token.name,
        `Storage definition "${token.name}" was registered after the storage lifecycle booted.`,
      );
    }

    const metadata = Reflect.getMetadata(STORAGE_METADATA_KEYS.DEFINITION, token) as
      | StorageDefinitionMetadata
      | undefined;
    if (!metadata) {
      throw this.definitionError(
        token.name,
        `Storage definition "${token.name}" is missing @JsonDocument() or @JsonCollection().`,
      );
    }

    const name = metadata.options.name;
    assertStoreName(name);
    const duplicate = this.names.get(name);
    if (duplicate && duplicate !== token) {
      throw this.definitionError(name, `Storage name "${name}" is already declared by "${duplicate.name}".`);
    }

    const filePath = this.resolvePath(name);
    const registered = this.createRegisteredStore(token, metadata, filePath);
    this.names.set(name, token);
    this.stores.set(token, registered);
    return registered;
  }

  private createRegisteredStore(
    token: Constructor<AnyDefinition>,
    metadata: StorageDefinitionMetadata,
    filePath: string,
  ): RegisteredStore {
    if (metadata.kind === 'document') {
      const parse = createStorageParser(metadata.options);
      const file = new AtomicJsonFile(metadata.options.name, filePath, metadata.options.defaults, parse);
      return { token, metadata, file, handle: new DocumentStore(file) };
    }

    const parseItem = createStorageParser(metadata.options);
    const parseCollection = (value: unknown): Record<string, unknown> => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new TypeError('Collection storage value must be an object.');
      }
      return Object.fromEntries(Object.entries(value).map(([id, entry]) => [id, parseItem(entry)]));
    };
    const createDefaults = metadata.options.defaults ?? (() => ({}));
    const file = new AtomicJsonFile(metadata.options.name, filePath, createDefaults, parseCollection);
    return { token, metadata, file, handle: new CollectionStore(file) };
  }

  private resolvePath(name: string): string {
    const override = this.config.paths?.[name];
    const configuredPath =
      override ?? join(this.config.directory ?? STORAGE_DEFAULTS.DIRECTORY, `${name}.json`);
    return resolve(process.cwd(), configuredPath);
  }

  private definitionError(storeName: string, message: string): StorageError {
    return new StorageError(message, { operation: 'configure', storeName });
  }
}
