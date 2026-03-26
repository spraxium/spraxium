export interface ResolvedAutocompleteHandler {
  commandName: string;
  optionName: string;
  instance: unknown;
  handlerCtor: new (...args: Array<unknown>) => unknown;
}
