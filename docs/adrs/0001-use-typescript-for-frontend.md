# ADR 0001: Use TypeScript for the Frontend

## Status

Accepted

## Date

2026-05-30

## Context

The current project is a small Vite React application using JavaScript files. The target architecture specifies `App.tsx` and `main.tsx`, and the application will handle authentication, backend response contracts, session state, localized UI, and validation logic. These areas benefit from explicit types because incorrect payloads or response handling can break critical user flows.

## Decision

The project shall migrate to TypeScript for application code. React components shall use `.tsx`; non-JSX modules shall use `.ts`. Backend request and response contracts shall be represented with TypeScript types under feature modules, starting with `src/features/auth/types.ts`.

TypeScript configuration shall be strict enough to catch unsafe API usage, missing fields, and nullable session state. Exceptions shall be local and explicit.

## Consequences

- API contracts become easier to review and refactor.
- Form values, auth responses, and session state gain compile-time checks.
- Initial migration requires renaming `src/App.jsx` and `src/main.jsx`, adding TypeScript configuration, and updating lint rules.
- Contributors must maintain types when backend contracts change.
