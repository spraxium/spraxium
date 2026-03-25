import { METADATA_KEYS } from '@spraxium/common';
import type { ExceptionLayout, ExceptionLayoutMap } from './interfaces';
import { DefaultExceptionLayout } from './layouts';
import type { SpraxiumException } from './spraxium.exception';
import type { ExceptionLayoutClass } from './types';

export class LayoutRegistry {
  public static resolve(exception: SpraxiumException, map?: ExceptionLayoutMap): ExceptionLayout {
    return new (LayoutRegistry.resolveClass(exception, map))();
  }

  public static resolveClass(exception: SpraxiumException, map?: ExceptionLayoutMap): ExceptionLayoutClass {
    if (exception.layout) return exception.layout;

    if (map) {
      const byType = map[exception.constructor.name];
      if (byType) return byType;
    }

    const decoratorLayout: ExceptionLayoutClass | undefined = Reflect.getOwnMetadata(
      METADATA_KEYS.EXCEPTION_LAYOUT,
      exception.constructor,
    );
    if (decoratorLayout) return decoratorLayout;
    if (map?.default) return map.default;

    return DefaultExceptionLayout;
  }
}
