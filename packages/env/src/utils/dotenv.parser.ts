export class DotEnvParser {
  static parse(content: string): Record<string, string> {
    const result: Record<string, string> = {};

    for (const rawLine of content.split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const eqIdx = line.indexOf('=');
      if (eqIdx < 1) continue;

      const key = line.slice(0, eqIdx).trim();
      let value = line.slice(eqIdx + 1).trim();

      if (!value.startsWith('"') && !value.startsWith("'")) {
        const commentIdx = value.indexOf(' #');
        if (commentIdx !== -1) value = value.slice(0, commentIdx).trim();
      }

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (key) result[key] = value;
    }

    return result;
  }
}
