export abstract class ReadonlyContainer {
  abstract get<T = unknown>(token: unknown): T | undefined;
}
