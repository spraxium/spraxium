export type TaskState = 'in_progress' | 'review' | 'todo' | 'done';

export interface Task {
  id: string;
  description: string;
  state: TaskState;
  steps: string[];
  due_date: Date;
}

export const TASKS: ReadonlyArray<Task> = [
  {
    id: 'task-001',
    description: 'Implement authentication flow with JWT and refresh tokens',
    state: 'in_progress',
    steps: [
      'Create login endpoint',
      'Generate JWT access token',
      'Implement refresh token storage',
      'Add token validation middleware',
      'Write integration tests',
    ],
    due_date: new Date('2026-05-20'),
  },
  {
    id: 'task-002',
    description: 'Design Discord V2 dynamic section components',
    state: 'review',
    steps: [
      'Define V2Section config updates',
      'Add dynamic button accessory support',
      'Implement runtime builder logic',
      'Write usage examples',
      'Review API consistency',
    ],
    due_date: new Date('2026-05-18'),
  },
  {
    id: 'task-003',
    description: 'Refactor component dispatcher lifecycle',
    state: 'todo',
    steps: [
      'Analyze dispatcher responsibilities',
      'Extract guard execution layer',
      'Reduce duplicated metadata lookups',
      'Improve error handling',
    ],
    due_date: new Date('2026-05-27'),
  },
  {
    id: 'task-004',
    description: 'Create leaderboard UI for game server',
    state: 'done',
    steps: [
      'Build leaderboard container',
      'Add dynamic player buttons',
      'Style medal rankings',
      'Test Discord component rendering',
    ],
    due_date: new Date('2026-05-10'),
  },
  {
    id: 'task-005',
    description: 'Optimize payload storage expiration cleanup',
    state: 'in_progress',
    steps: [
      'Inspect payload lifecycle',
      'Add TTL cleanup scheduler',
      'Prevent stale payload access',
      'Benchmark memory usage',
    ],
    due_date: new Date('2026-05-23'),
  },
];
