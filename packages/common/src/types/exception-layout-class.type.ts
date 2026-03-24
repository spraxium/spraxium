export type ExceptionLayoutClass = new () => {
  // biome-ignore lint/suspicious/noExplicitAny: intentional loose type — full generics live in @spraxium/core
  build(exception: any, ctx: any): any;
};
