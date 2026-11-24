import type { VersionSwitchProject } from '../version-switch.project';
import type { FrameworkDependency } from './framework-dependency.interface';

export interface VersionSwitchPlan {
  project: VersionSwitchProject;
  version: string;
  dependencies: ReadonlyArray<FrameworkDependency>;
}
