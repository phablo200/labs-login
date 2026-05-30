# ADR 0010: Testing Strategy for Auth Frontend

## Status

Accepted

## Date

2026-05-30

## Context

The SRS requires reliable validation, backend error handling, localization, routing, and session behavior. The current project has no automated test runner configured.

## Decision

The project shall adopt a layered testing strategy:

- Unit tests for validation schemas, session helpers, and auth API response handling.
- Component tests for form behavior, inline validation errors, disabled states, and toast triggers.
- Integration-style tests with mocked backend responses for successful auth, 4xx errors, 5xx errors, and network failures.
- Manual checks for responsive layout, keyboard navigation, language switching, and password reset links.

Vitest and React Testing Library shall be preferred because they integrate well with Vite and React.

## Consequences

- Critical auth behavior can be changed with confidence.
- Tests remain close to implementation without requiring a browser automation stack immediately.
- Additional dev dependencies and setup are required.
- Full end-to-end tests may be added later if the app grows or backend integration becomes more complex.
