import { V2Container, V2Section, V2Separator, V2Text, desc } from '@spraxium/components';

export interface InfoData {
  /** Header string, pre-resolved via i18n.t() before calling buildLocalizedV2(). */
  header: string;
}

/**
 * V2 showcase container demonstrating two i18n resolution paths:
 *
 *  1. **Data-driven** (`@V2Text` with a factory function): the caller resolves the
 *     translation first (`i18n.t()`) and passes the result as part of `data`.
 *
 *  2. **Static-key patch** (`@V2Section` with `i18n: { text: '...' }`): the static
 *     fallback string is overridden in-place by `buildLocalizedV2()` using the
 *     locale file, no explicit `i18n.t()` call needed in the handler.
 */
@V2Container({ accentColor: 0x57f287 })
export class InfoContainer {
  // Approach 1: data-driven: header resolved by the caller before build.
  @V2Text((d: InfoData) => desc().h2(d.header))
  title!: never;

  @V2Separator()
  sep!: never;

  // Approach 2: static key: buildLocalizedV2() reads cfg.i18n.text and patches
  // the content string before delegating to V2Service.
  @V2Section({
    text: 'This container was built with buildLocalizedV2() from @spraxium/i18n.',
    i18n: { text: 'commands.components.showcase.v2.body' },
    thumbnail: {
      url: 'https://placehold.co/64x64/57f287/000000.png?text=V2',
      description: 'V2 demo thumbnail',
    },
  })
  body!: never;
}
