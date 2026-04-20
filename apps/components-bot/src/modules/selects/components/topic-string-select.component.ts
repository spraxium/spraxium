import { SelectOption, StringSelect } from '@spraxium/components';

@StringSelect({ customId: 'sel_topic', placeholder: 'Choose a topic…', minValues: 1, maxValues: 1 })
@SelectOption({ label: 'Bug report', value: 'bug', description: 'Something is broken', emoji: '🐛' })
@SelectOption({ label: 'Feature request', value: 'feature', description: 'New idea or improvement', emoji: '✨' })
@SelectOption({ label: 'Question', value: 'question', description: 'General question', emoji: '❓' })
@SelectOption({ label: 'Feedback', value: 'feedback', description: 'Share your thoughts', emoji: '💬' })
export class TopicStringSelect {}
