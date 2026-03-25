/**
 * Loose constructor type for exception layouts.
 *
 * Kept loose (using `any`) to avoid a circular import: the full
 * ExceptionLayout interface with proper generic types lives in
 * exception-layout.interface.ts, which imports SpraxiumException.
 */
// biome-ignore lint/suspicious/noExplicitAny: intentional loose type to break circular import
export type ExceptionLayoutClass = new () => { build(exception: any, ctx: any): any };
