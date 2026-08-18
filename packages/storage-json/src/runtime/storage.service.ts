import { type Constructor, Inject, Injectable } from '@spraxium/common';
import type { CollectionDefinition } from '../definitions/collection-definition';
import type { DocumentDefinition } from '../definitions/document-definition';
import type { CollectionStore } from './collection.store';
import type { DocumentStore } from './document.store';
import { StorageRegistry } from './storage.registry';

@Injectable()
export class StorageService {
  constructor(@Inject(StorageRegistry) private readonly registry: StorageRegistry) {}

  document<T>(token: Constructor<DocumentDefinition<T>>): DocumentStore<T> {
    return this.registry.document(token);
  }

  collection<T>(token: Constructor<CollectionDefinition<T>>): CollectionStore<T> {
    return this.registry.collection(token);
  }

  registered(): Array<string> {
    return this.registry.registered();
  }
}
