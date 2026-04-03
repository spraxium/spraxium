export interface EmbedFieldDef {
  propertyKey: string;
  order: number;
  name: string | ((data: unknown) => string);
  value: string | ((data: unknown) => string);
  inline?: boolean;
}

export interface EmbedDescriptionDef {
  propertyKey: string;
  value: string | ((data: unknown) => string | { toString(): string });
}
