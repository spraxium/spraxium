# Contributing to Spraxium

Thank you for your interest in contributing! This document covers everything you need to get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md). We expect all contributors to uphold it.

---

## Getting Started

**Prerequisites:**

- Node.js 18+
- [pnpm](https://pnpm.io/) 9+

**Setup:**

```bash
git clone https://github.com/spacelaxy/spraxium.git
cd spraxium
pnpm install
```

**Build all packages:**

```bash
pnpm build
```

**Run tests:**

```bash
pnpm test
```

---

## Project Structure

```
spraxium/
├── packages/         # Core framework packages (@spraxium/*)
│   ├── core/
│   ├── http/
│   ├── common/
│   └── ...
├── apps/
│   └── sandbox/      # Local development sandbox (not published)
└── docs/             # Documentation site
```

Each package under `packages/` is independently publishable. When working on a package, navigate into it directly or use pnpm filters:

```bash
pnpm --filter @spraxium/http build
pnpm --filter @spraxium/http test
```

---

## Development Workflow

1. **Fork** the repository and create a branch from `main`
2. **Make your changes** in the relevant package(s)
3. **Write or update tests** if applicable
4. **Run the linter** before committing:
   ```bash
   pnpm lint
   ```
5. **Run type checks:**
   ```bash
   pnpm --filter ./packages/* exec tsc --noEmit
   ```
6. **Commit** following the convention below
7. **Open a pull request** against `main`

---

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

**Types:**

| Emoji | Type | When to use |
|-------|------|-------------|
| ✨ | `feat` | New feature |
| 🐛 | `fix` | Bug fix |
| 📝 | `docs` | Documentation only |
| ♻️ | `refactor` | Code change that neither fixes a bug nor adds a feature |
| ✅ | `test` | Adding or updating tests |
| 🔧 | `chore` | Build process, tooling, dependencies |
| ⚡️ | `perf` | Performance improvement |
| 🔒️ | `security` | Security fix or hardening |
| 🚀 | `release` | Release / version bump |
| 💥 | `breaking` | Breaking change (use alongside another type) |

**Scope** is the package name (e.g. `http`, `core`, `i18n`) or `repo` for monorepo-level changes.

**Examples:**

```
✨ feat(http): add rate limit per route configuration
🐛 fix(core): resolve lifecycle hook ordering on shutdown
📝 docs(repo): add contributing guide
🔧 chore(http): update hono to v4.7
⚡️ perf(core): lazy-instantiate services on first use
```

---

## Submitting a Pull Request

- Keep PRs focused, one feature or fix per PR
- Reference any related issue in the PR description (`Closes #123`)
- Make sure all checks pass (lint, type check, tests) before requesting review
- Add a brief description of **what** changed and **why**

For large changes, open an issue first to discuss the approach before investing time in implementation.

---

## Reporting Issues

Use [GitHub Issues](https://github.com/spraxium/spraxium/issues) for:

- Bug reports
- Feature requests
- Documentation gaps

For **security vulnerabilities**, do **not** open a public issue, follow the [Security Policy](./SECURITY.md) instead.

---

*Maintained by [Spacelaxy](https://github.com/spacelaxy)*
