export interface Topic {
  slug: string;
  name: string;
  description: string;
}

export const TOPICS: ReadonlyArray<Topic> = [
  { slug: 'frontend', name: '🎨 Frontend', description: 'React, Vue, Astro & friends' },
  { slug: 'backend', name: '🔧 Backend', description: 'APIs, databases, infra' },
  { slug: 'devops', name: '🐳 DevOps', description: 'Docker, Kubernetes, CI/CD' },
  { slug: 'mobile', name: '📱 Mobile', description: 'iOS, Android, React Native' },
  { slug: 'gamedev', name: '🎮 Game dev', description: 'Engines, graphics, gameplay' },
];

export interface TopicsQuery {
  audience: 'beginner' | 'pro';
  topics: ReadonlyArray<Topic>;
}
