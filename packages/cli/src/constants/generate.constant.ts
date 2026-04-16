export const GenerateConstant = {
  CLASS_SUFFIX_MAP: {
    service: 'Service',
    'boot-service': 'Service',
    task: 'Task',
    listener: 'Listener',
  } as Record<string, string>,

  SUB_DIR_MAP: {
    listener: 'listeners',
    task: 'tasks',
  } as Record<string, string>,

  DEFAULT_SUB_DIR: 'services',
} as const;
