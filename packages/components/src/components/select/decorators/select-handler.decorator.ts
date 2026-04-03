import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys';
import type { AnyConstructor } from '../../../types';
import type { SelectHandlerMeta } from '../interfaces';

function makeSelectHandler(component: AnyConstructor): ClassDecorator {
  return (target): void => {
    const meta: SelectHandlerMeta = { component };
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.SELECT_HANDLER, meta, target);
  };
}

/**
 * Class decorator that links a handler to a `@StringSelect()` component.
 *
 * @param component The string select class this handler responds to
 */
export function StringSelectHandler(component: AnyConstructor): ClassDecorator {
  return makeSelectHandler(component);
}

/**
 * Class decorator that links a handler to a `@UserSelect()` component.
 *
 * @param component The user select class this handler responds to
 */
export function UserSelectHandler(component: AnyConstructor): ClassDecorator {
  return makeSelectHandler(component);
}

/**
 * Class decorator that links a handler to a `@RoleSelect()` component.
 *
 * @param component The role select class this handler responds to
 */
export function RoleSelectHandler(component: AnyConstructor): ClassDecorator {
  return makeSelectHandler(component);
}

/**
 * Class decorator that links a handler to a `@MentionableSelect()` component.
 *
 * @param component The mentionable select class this handler responds to
 */
export function MentionableSelectHandler(component: AnyConstructor): ClassDecorator {
  return makeSelectHandler(component);
}

/**
 * Class decorator that links a handler to a `@ChannelSelect()` component.
 *
 * @param component The channel select class this handler responds to
 */
export function ChannelSelectHandler(component: AnyConstructor): ClassDecorator {
  return makeSelectHandler(component);
}
