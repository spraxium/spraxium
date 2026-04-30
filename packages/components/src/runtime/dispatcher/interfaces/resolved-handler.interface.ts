import type { Constructor } from '../types/constructor.type';

export interface ResolvedModalHandler {
  customId: string;
  handlerCtor: Constructor;
  handlerInstance: unknown;
  builderCtor: Constructor;
}

export interface ResolvedSelectHandler {
  customId: string;
  handlerCtor: Constructor;
  handlerInstance: unknown;
}

export interface ResolvedButtonHandler {
  customId: string;
  handlerCtor: Constructor;
  handlerInstance: unknown;
}

export interface ResolvedDynamicButtonHandler {
  /** Base ID configured on `@DynamicButton({ baseId })`. */
  baseId: string;
  handlerCtor: Constructor;
  handlerInstance: unknown;
}

export interface ResolvedDynamicSelectHandler {
  /** Base ID configured on `@DynamicStringSelect({ baseId })`. */
  baseId: string;
  handlerCtor: Constructor;
  handlerInstance: unknown;
}
