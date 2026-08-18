import type { AtomicJsonFile } from './atomic-json-file';

export class DocumentStore<T> {
  constructor(private readonly file: AtomicJsonFile<T>) {}

  get name(): string {
    return this.file.name;
  }

  read(): Promise<T> {
    return this.file.read();
  }

  replace(value: T): Promise<void> {
    return this.file.replace(value);
  }

  update<R>(mutator: (draft: T) => R | Promise<R>): Promise<R> {
    return this.file.mutate(mutator);
  }

  reset(): Promise<void> {
    return this.file.reset();
  }
}
