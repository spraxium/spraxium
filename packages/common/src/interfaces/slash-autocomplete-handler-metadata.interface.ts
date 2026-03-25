export interface SlashAutocompleteHandlerMetadata {
  command: new () => object;
  optionName: string;
}
