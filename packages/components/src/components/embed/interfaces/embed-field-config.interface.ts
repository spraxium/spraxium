export interface EmbedFieldConfig<T = unknown> {
  name: string | ((data: T) => string);
  value: string | ((data: T) => string);
  inline?: boolean;
}
