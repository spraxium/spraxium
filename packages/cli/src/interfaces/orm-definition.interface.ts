export interface DbOption {
  readonly id: string;
  readonly label: string;
}

export interface EnvKeySpec {
  readonly key: string;
  readonly default?: string;
}

export interface DbEntry extends DbOption {
  readonly runtimePackages: ReadonlyArray<string>;
  readonly devPackages: ReadonlyArray<string>;
  readonly postInstall: ReadonlyArray<string>;
  readonly nextSteps: ReadonlyArray<string>;
  readonly envKeys: ReadonlyArray<EnvKeySpec>;
}

export interface OrmEntry {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly databases: ReadonlyArray<DbEntry>;
}
