import {
  ChannelSelect,
  MentionableSelect,
  RoleSelect,
  SelectOption,
  StringSelect,
  UserSelect,
} from '@spraxium/components';
import { ChannelType } from 'discord.js';

@StringSelect({ customId: 'demo_topic', placeholder: 'Choose a topic…', minValues: 1, maxValues: 1 })
@SelectOption({ label: 'Bug report',       value: 'bug',     description: 'Something is broken',       emoji: '🐛' })
@SelectOption({ label: 'Feature request',  value: 'feature', description: 'New idea or improvement',   emoji: '✨' })
@SelectOption({ label: 'Question',         value: 'question',                                           emoji: '❓' })
@SelectOption({ label: 'Feedback',         value: 'feedback',description: 'General feedback',          emoji: '💬' })
export class TopicStringSelect {}

@StringSelect({ customId: 'demo_areas', placeholder: 'Select affected areas…', minValues: 1, maxValues: 3 })
@SelectOption({ label: 'Frontend',  value: 'frontend',  emoji: '🖼️'  })
@SelectOption({ label: 'Backend',   value: 'backend',   emoji: '⚙️'  })
@SelectOption({ label: 'Database',  value: 'database',  emoji: '🗄️'  })
@SelectOption({ label: 'DevOps',    value: 'devops',    emoji: '🚀'  })
@SelectOption({ label: 'Docs',      value: 'docs',      emoji: '📄'  })
export class AreasMultiSelect {}

@UserSelect({ customId: 'demo_mention_user', placeholder: 'Pick a user…' })
export class MentionUserSelect {}

@RoleSelect({ customId: 'demo_assign_role', placeholder: 'Pick a role…' })
export class AssignRoleSelect {}

@MentionableSelect({ customId: 'demo_mention', placeholder: 'Mention users or roles…', maxValues: 5 })
export class AnyMentionSelect {}

@ChannelSelect({
  customId: 'demo_channel',
  placeholder: 'Pick a text channel…',
  channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
})
export class TextChannelSelect {}
