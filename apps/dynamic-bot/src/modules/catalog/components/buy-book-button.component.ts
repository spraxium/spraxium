import { DynamicButton } from '@spraxium/components';
import type { ButtonRenderConfig } from '@spraxium/components';
import type { Book } from '../catalog.data';

@DynamicButton({ baseId: 'catalog-buy', payloadTtl: 600 })
export class BuyBookButton {
  static render(book: Book): ButtonRenderConfig {
    return {
      label: `Buy "${book.title}" — $${book.price}`,
      style: 'success',
      emoji: '🛒',
    };
  }
}
