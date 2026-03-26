export interface ResolvedSlashEntry {
  commandName: string;
  handlerClass: string;
  sub?: string;
  group?: string;
  optionCount: number;
}
