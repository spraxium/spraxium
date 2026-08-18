/** Type-only token base for a collection declared with @JsonCollection(). */
export abstract class CollectionDefinition<T> {
  declare readonly __collectionItemType: T;
}
