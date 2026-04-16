import {
  ChannelSelectMenuBuilder,
  CheckboxBuilder,
  CheckboxGroupBuilder,
  CheckboxGroupOptionBuilder,
  FileUploadBuilder,
  LabelBuilder,
  MentionableSelectMenuBuilder,
  ModalBuilder as DjsModalBuilder,
  RadioGroupBuilder,
  RadioGroupOptionBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  UserSelectMenuBuilder,
} from '@discordjs/builders';
import { TextInputStyle } from 'discord.js';
import type { ModalBuilder } from 'discord.js';
import type {
  ModalChannelSelectFieldDef,
  ModalCheckboxFieldDef,
  ModalCheckboxGroupFieldDef,
  ModalFieldDef,
  ModalFileUploadFieldDef,
  ModalMentionableSelectFieldDef,
  ModalRadioGroupFieldDef,
  ModalRoleSelectFieldDef,
  ModalSchema,
  ModalStringSelectFieldDef,
  ModalTextDisplayDef,
  ModalTextFieldDef,
  ModalUserSelectFieldDef,
} from '../interfaces';

type LabelFieldDef = Exclude<ModalFieldDef, ModalTextDisplayDef>;

export class ModalRenderer {
  render(schema: ModalSchema): ModalBuilder {
    const modal = new DjsModalBuilder().setCustomId(schema.id).setTitle(schema.title);

    for (const display of schema.textDisplays) {
      modal.addTextDisplayComponents(new TextDisplayBuilder({ content: display.content }));
    }

    for (const field of schema.fields) {
      if (field.type === 'text_display') {
        modal.addTextDisplayComponents(new TextDisplayBuilder({ content: field.content }));
        continue;
      }
      modal.addLabelComponents(this.buildLabel(field));
    }

    return modal as unknown as ModalBuilder;
  }

  private buildLabel(field: LabelFieldDef): LabelBuilder {
    const label = new LabelBuilder().setLabel(field.label);
    if ('description' in field && field.description) label.setDescription(field.description);

    switch (field.type) {
      case 'text':
        return label.setTextInputComponent(this.buildTextInput(field)) as unknown as LabelBuilder;
      case 'string_select':
        return label.setStringSelectMenuComponent(this.buildStringSelect(field)) as unknown as LabelBuilder;
      case 'user_select':
        return label.setUserSelectMenuComponent(this.buildUserSelect(field)) as unknown as LabelBuilder;
      case 'role_select':
        return label.setRoleSelectMenuComponent(this.buildRoleSelect(field)) as unknown as LabelBuilder;
      case 'mentionable_select':
        return label.setMentionableSelectMenuComponent(
          this.buildMentionableSelect(field),
        ) as unknown as LabelBuilder;
      case 'channel_select':
        return label.setChannelSelectMenuComponent(this.buildChannelSelect(field)) as unknown as LabelBuilder;
      case 'file_upload':
        return label.setFileUploadComponent(this.buildFileUpload(field)) as unknown as LabelBuilder;
      case 'radio_group':
        return label.setRadioGroupComponent(this.buildRadioGroup(field)) as unknown as LabelBuilder;
      case 'checkbox_group':
        return label.setCheckboxGroupComponent(this.buildCheckboxGroup(field)) as unknown as LabelBuilder;
      case 'checkbox':
        return label.setCheckboxComponent(this.buildCheckbox(field)) as unknown as LabelBuilder;
    }
  }

  private buildTextInput(field: ModalTextFieldDef): TextInputBuilder {
    const input = new TextInputBuilder()
      .setCustomId(field.id)
      .setStyle(field.style === 'paragraph' ? TextInputStyle.Paragraph : TextInputStyle.Short);

    if (field.required !== undefined) input.setRequired(field.required);
    if (field.placeholder) input.setPlaceholder(field.placeholder);
    if (field.minLength !== undefined) input.setMinLength(field.minLength);
    if (field.maxLength !== undefined) input.setMaxLength(field.maxLength);
    if (field.value !== undefined) input.setValue(field.value);

    return input;
  }

  private buildStringSelect(field: ModalStringSelectFieldDef): StringSelectMenuBuilder {
    const select = new StringSelectMenuBuilder().setCustomId(field.id);
    if (field.placeholder) select.setPlaceholder(field.placeholder);
    if (field.minValues !== undefined) select.setMinValues(field.minValues);
    if (field.maxValues !== undefined) select.setMaxValues(field.maxValues);
    if (field.required !== undefined) select.setRequired(field.required);
    if (field.disabled !== undefined) select.setDisabled(field.disabled);

    if (field.options.length > 0) {
      select.addOptions(
        field.options.map((o) => {
          const opt = new StringSelectMenuOptionBuilder().setLabel(o.label).setValue(o.value);
          if (o.description) opt.setDescription(o.description);
          if (o.default) opt.setDefault(o.default);
          if (o.emoji) opt.setEmoji(typeof o.emoji === 'string' ? { name: o.emoji } : o.emoji);
          return opt;
        }),
      );
    }

    return select as unknown as StringSelectMenuBuilder;
  }

  private buildUserSelect(field: ModalUserSelectFieldDef): UserSelectMenuBuilder {
    const select = new UserSelectMenuBuilder().setCustomId(field.id);
    if (field.placeholder) select.setPlaceholder(field.placeholder);
    if (field.minValues !== undefined) select.setMinValues(field.minValues);
    if (field.maxValues !== undefined) select.setMaxValues(field.maxValues);
    if (field.required !== undefined) select.setRequired(field.required);
    if (field.disabled !== undefined) select.setDisabled(field.disabled);
    return select as unknown as UserSelectMenuBuilder;
  }

  private buildRoleSelect(field: ModalRoleSelectFieldDef): RoleSelectMenuBuilder {
    const select = new RoleSelectMenuBuilder().setCustomId(field.id);
    if (field.placeholder) select.setPlaceholder(field.placeholder);
    if (field.minValues !== undefined) select.setMinValues(field.minValues);
    if (field.maxValues !== undefined) select.setMaxValues(field.maxValues);
    if (field.required !== undefined) select.setRequired(field.required);
    if (field.disabled !== undefined) select.setDisabled(field.disabled);
    return select as unknown as RoleSelectMenuBuilder;
  }

  private buildMentionableSelect(field: ModalMentionableSelectFieldDef): MentionableSelectMenuBuilder {
    const select = new MentionableSelectMenuBuilder().setCustomId(field.id);
    if (field.placeholder) select.setPlaceholder(field.placeholder);
    if (field.minValues !== undefined) select.setMinValues(field.minValues);
    if (field.maxValues !== undefined) select.setMaxValues(field.maxValues);
    if (field.required !== undefined) select.setRequired(field.required);
    if (field.disabled !== undefined) select.setDisabled(field.disabled);
    return select as unknown as MentionableSelectMenuBuilder;
  }

  private buildChannelSelect(field: ModalChannelSelectFieldDef): ChannelSelectMenuBuilder {
    const select = new ChannelSelectMenuBuilder().setCustomId(field.id);
    if (field.placeholder) select.setPlaceholder(field.placeholder);
    if (field.minValues !== undefined) select.setMinValues(field.minValues);
    if (field.maxValues !== undefined) select.setMaxValues(field.maxValues);
    if (field.required !== undefined) select.setRequired(field.required);
    if (field.disabled !== undefined) select.setDisabled(field.disabled);
    if (field.channelTypes && field.channelTypes.length > 0) {
      // biome-ignore lint/suspicious/noExplicitAny: discord.js ChannelType enum spread requires cast
      select.setChannelTypes(...(field.channelTypes as Array<any>));
    }
    return select as unknown as ChannelSelectMenuBuilder;
  }

  private buildFileUpload(field: ModalFileUploadFieldDef): FileUploadBuilder {
    const upload = new FileUploadBuilder().setCustomId(field.id);
    if (field.minFiles !== undefined) upload.setMinValues(field.minFiles);
    if (field.maxFiles !== undefined) upload.setMaxValues(field.maxFiles);
    if (field.required !== undefined) upload.setRequired(field.required);
    return upload as unknown as FileUploadBuilder;
  }

  private buildRadioGroup(field: ModalRadioGroupFieldDef): RadioGroupBuilder {
    const group = new RadioGroupBuilder().setCustomId(field.id);
    if (field.required !== undefined) group.setRequired(field.required);
    if (field.choices.length > 0) {
      group.addOptions(
        field.choices.map((c) => {
          const opt = new RadioGroupOptionBuilder().setLabel(c.label).setValue(c.value);
          if (c.description) opt.setDescription(c.description);
          if (c.default) opt.setDefault(c.default);
          return opt;
        }),
      );
    }
    return group;
  }

  private buildCheckboxGroup(field: ModalCheckboxGroupFieldDef): CheckboxGroupBuilder {
    const group = new CheckboxGroupBuilder().setCustomId(field.id);
    if (field.required !== undefined) group.setRequired(field.required);
    if (field.minValues !== undefined) group.setMinValues(field.minValues);
    if (field.maxValues !== undefined) group.setMaxValues(field.maxValues);
    if (field.choices.length > 0) {
      group.addOptions(
        field.choices.map((c) => {
          const opt = new CheckboxGroupOptionBuilder().setLabel(c.label).setValue(c.value);
          if (c.description) opt.setDescription(c.description);
          if (c.default) opt.setDefault(c.default);
          return opt;
        }),
      );
    }
    return group;
  }

  private buildCheckbox(field: ModalCheckboxFieldDef): CheckboxBuilder {
    const checkbox = new CheckboxBuilder().setCustomId(field.id);
    if (field.defaultChecked !== undefined) checkbox.setDefault(field.defaultChecked);
    return checkbox;
  }
}
