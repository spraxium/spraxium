export interface ModalComponentMetadata {
  id: string;
  title: string;
}

export interface ModalHandlerMetadata {
  builder: new (
    // biome-ignore lint/suspicious/noExplicitAny: any class is valid as a builder reference
    ...args: Array<any>
  ) => object;
}
