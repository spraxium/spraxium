import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],

  parserPreset: {
    parserOpts: {
      headerPattern: /^((?::\w+:|✨|🐛|📝|♻️|✅|🔧|⚡️|🔒️|🚀|💥)\s)?(\w+)(?:\(([^)]+)\))?:\s(.+)$/,
      headerCorrespondence: ['emoji', 'type', 'scope', 'subject'],
    },
  },

  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'refactor', 'test', 'chore', 'perf', 'security', 'release', 'breaking'],
    ],

    'scope-empty': [2, 'never'],
    'scope-case': [0],
    'subject-empty': [2, 'never'],
    'subject-case': [0],
    'header-max-length': [2, 'always', 200],
  },
};

export default config;
