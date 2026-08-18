/** Type-only token base for a document declared with @JsonDocument(). */
export abstract class DocumentDefinition<T> {
  declare readonly __documentType: T;
}
