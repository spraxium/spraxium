/** Result of parsing a `ListenerBinder` group-key string (`"<event>:<once>"`). */
export interface ParsedGroupKey {
  event: string;
  once: boolean;
}
