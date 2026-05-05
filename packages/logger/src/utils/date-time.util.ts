let activeLocale = 'en-US';

export function setLocale(locale: string): void {
  activeLocale = locale;
}

export function formatDate(d = new Date()): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function formatTime(d = new Date(), locale = activeLocale): string {
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** Built-in named timestamp formats. */
export type TimestampFormat = 'default' | 'iso' | 'time-only' | ((d: Date) => string);

export function formatTimestamp(d: Date, format: TimestampFormat = 'default'): string {
  if (typeof format === 'function') return format(d);
  if (format === 'iso') return d.toISOString();
  if (format === 'time-only') return formatTime(d);
  return `${formatDate(d)} - ${formatTime(d)}`;
}
