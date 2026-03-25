export interface ActivityOptions {
  name: string;
  type: 'Playing' | 'Streaming' | 'Listening' | 'Watching' | 'Competing';
  url?: string;
}
