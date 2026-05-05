import type { LogColorInput } from './log-color.type';

/** Definition of a custom log level and the console color to render it with. */
export interface CustomLogLevel {
  name: string;
  color: LogColorInput;
}
