// biome-ignore lint/suspicious/noExplicitAny: intentional loose type — full generics live in @spraxium/core
export type ExceptionLayoutClass = new () => {
  build(exception: any, ctx: any): any;
};