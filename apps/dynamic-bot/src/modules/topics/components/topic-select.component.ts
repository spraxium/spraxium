import { DynamicStringSelect } from '@spraxium/components';
import type { SelectRenderConfig } from '@spraxium/components';
import type { TopicsQuery } from '../topics.data';

@DynamicStringSelect({
  baseId: 'topic-pick',
  placeholder: 'Pick one or more topics',
  minValues: 1,
  maxValues: 3,
  payloadTtl: 600,
})
export class TopicSelect {
  static render(query: TopicsQuery): SelectRenderConfig {
    return {
      options: query.topics.map((t) => ({
        label: t.name,
        value: t.slug,
        description: t.description,
      })),
    };
  }
}
