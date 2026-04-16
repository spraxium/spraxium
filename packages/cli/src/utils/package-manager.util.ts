import { select } from '@inquirer/prompts';
import { MessageConstant, NewCommandConstant } from '../constants';
import type { PackageManager } from '../interfaces';
import type { ProcessRunner } from '../service/process-runner.service';

export async function resolvePackageManager(runner: ProcessRunner): Promise<PackageManager> {
  const checks = await Promise.all(
    NewCommandConstant.ALL_PACKAGE_MANAGERS.map(async (pm) => ({
      pm,
      available: await runner.silent(pm, ['--version']),
    })),
  );

  const available = checks.filter((c) => c.available).map((c) => c.pm);
  const pms = available.length > 0 ? available : (['npm'] as Array<PackageManager>);

  if (pms.length === 1) return pms[0] as PackageManager;

  return select<PackageManager>({
    message: MessageConstant.NEW_PM_PROMPT,
    choices: pms.map((pm) => ({ value: pm, name: pm })),
  });
}
