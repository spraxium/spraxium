export interface EnvOptions {
  /** Default value used when the env variable is absent. Sets the field as optional. */
  default?: string;
  /** Mask the value in the startup log. @default true */
  secret?: boolean;
}
