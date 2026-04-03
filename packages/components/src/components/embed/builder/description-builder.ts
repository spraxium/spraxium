/**
 * Fluent builder for Discord embed descriptions.
 * Compose multi-line descriptions without string concatenation.
 *
 * @example
 * ```ts
 * desc().h2('Stats').empty().line(`Members: ${count}`).build()
 * ```
 */
export class DescriptionBuilder {
  private readonly parts: Array<string> = [];

  /** Appends a line of text. */
  line(text: string): this {
    this.parts.push(text);
    return this;
  }

  /** Appends a blank line. */
  empty(): this {
    return this.line('');
  }

  /** Appends `# text`. */
  h1(text: string): this {
    return this.line(`# ${text}`);
  }

  /** Appends `## text`. */
  h2(text: string): this {
    return this.line(`## ${text}`);
  }

  /** Appends `### text`. */
  h3(text: string): this {
    return this.line(`### ${text}`);
  }

  /** Appends `**text**`. */
  bold(text: string): this {
    return this.line(`**${text}**`);
  }

  /** Appends `*text*`. */
  italic(text: string): this {
    return this.line(`*${text}*`);
  }

  /** Appends `> text`. */
  quote(text: string): this {
    return this.line(`> ${text}`);
  }

  /** Appends `-# text` (Discord subtext). */
  subtext(text: string): this {
    return this.line(`-# ${text}`);
  }

  /** Appends `` `code` ``. */
  inlineCode(text: string): this {
    return this.line(`\`${text}\``);
  }

  /** Appends a fenced code block. */
  code(langOrCode: string, body?: string): this {
    if (body !== undefined) return this.line(`\`\`\`${langOrCode}\n${body}\n\`\`\``);
    return this.line(`\`\`\`\n${langOrCode}\n\`\`\``);
  }

  /** Appends a bulleted list. */
  list(items: Array<string>): this {
    for (const item of items) this.line(`• ${item}`);
    return this;
  }

  /** Appends a numbered list. */
  numberedList(items: Array<string>): this {
    items.forEach((item, i) => this.line(`${i + 1}. ${item}`));
    return this;
  }

  /** Conditionally appends content. */
  when(condition: boolean, callback: (builder: this) => void): this {
    if (condition) callback(this);
    return this;
  }

  /** Joins all parts with newlines. */
  build(): string {
    return this.parts.join('\n');
  }

  toString(): string {
    return this.build();
  }
}

/** Creates a new `DescriptionBuilder`. */
export function desc(): DescriptionBuilder {
  return new DescriptionBuilder();
}
