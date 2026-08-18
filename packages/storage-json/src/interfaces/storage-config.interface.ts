export interface StorageConfig {
  /** Directory used by stores without an explicit path override. @default '.spraxium/storage' */
  directory?: string;
  /** File paths keyed by the logical store name. Relative paths resolve from process.cwd(). */
  paths?: Record<string, string>;
}
