import type { Constructor } from './constructor.type';

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
  prefix: string;
  handlerCtor: Constructor;
  handlerInstance: unknown;
}
