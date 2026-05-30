# ADR 0002: Use Feature-Based Frontend Architecture

## Status

Accepted

## Date

2026-05-30

## Context

The application scope is closed and small, but it must remain scalable. Authentication includes several related flows: sign in, sign up, password recovery, reset password, OTP login, provider login placeholders, session handling, validation, and backend integration.

## Decision

The source tree shall follow a feature-based architecture:

```text
src/
├── assets/
├── components/
│   └── ui/
├── features/
│   └── auth/
│       ├── components/
│       ├── hooks/
│       ├── api.ts
│       └── types.ts
├── hooks/
├── lib/
├── pages/
├── App.tsx
└── main.tsx
```

Feature-specific code shall live under `src/features/auth`. Shared UI primitives shall live under `src/components/ui`. Shared utilities, API client setup, session helpers, i18n setup, and config shall live under `src/lib`.

## Consequences

- Auth code remains cohesive and easier to test.
- Shared components are reusable without coupling them to auth.
- New features can be added under `src/features/<feature-name>` without flattening the codebase.
- Contributors must avoid placing feature-specific logic in global folders.
