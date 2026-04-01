# Security Policy

## Supported Versions

Spraxium is currently in early development. Only the current release (`0.0.1`) receives security patches.

| Version | Supported          |
| ------- | ------------------ |
| 0.0.1   | ✅ |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a vulnerability, please report it responsibly by emailing:

**hello@spraxium.com**

Include as much of the following information as possible to help us understand and reproduce the issue:

- Type of issue (e.g., injection, authentication bypass, privilege escalation, etc.)
- Affected package(s) and version(s)
- Full path of the source file(s) related to the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if available)
- Potential impact and severity assessment

## Response Timeline

| Stage                        | Target Time   |
| ---------------------------- | ------------- |
| Initial acknowledgement      | 48 hours      |
| Severity assessment          | 3 business days |
| Fix or mitigation available  | 30 days (critical), 90 days (others) |
| Public disclosure            | Coordinated with reporter |

We follow responsible disclosure. We will notify you when the issue is resolved and coordinate with you before any public disclosure.

## Scope

The following packages are in scope for security reports:

- `@spraxium/core`
- `@spraxium/http`
- `@spraxium/common`
- `@spraxium/env`
- `@spraxium/i18n`
- `@spraxium/schedule`
- `@spraxium/signal`
- `@spraxium/signal-client`
- `@spraxium/analytics`
- `@spraxium/components`
- `@spraxium/cli`

**Out of scope:**

- Issues in third-party dependencies (report those upstream)
- Vulnerabilities in the `apps/sandbox` example application
- Social engineering attacks

## Security Best Practices

When using Spraxium in production:

- Always keep dependencies up to date (`pnpm update`)
- Set `NODE_ENV=production` to disable debug features
- Use the `@spraxium/env` package to validate all environment variables at startup
- Avoid exposing internal HTTP routes without authentication guards
- Review and restrict CORS origins via `@spraxium/http` configuration
- Use API key guards or custom `HttpGuard` implementations to protect sensitive endpoints
- Rotate secrets regularly and never commit `.env` files to version control

## Credits

We are grateful to the security researchers and community members who responsibly disclose vulnerabilities. Verified reporters will be acknowledged in the release notes (unless they prefer to remain anonymous).

---

*This security policy is maintained by [Spacelaxy](https://spacelaxy.com).*
