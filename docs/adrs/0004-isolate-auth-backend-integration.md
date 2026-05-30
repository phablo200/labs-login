# ADR 0004: Isolate Auth Backend Integration

## Status

Accepted

## Date

2026-05-30

## Context

The frontend consumes the existing `auth-service` backend. Auth endpoints require `x-api-key`, `x-application-id`, and `accept-language` headers. Successful auth responses may include JWT tokens, and 4xx responses return an `error` key. Backend details should not leak throughout components.

## Decision

All auth backend calls shall be isolated in `src/features/auth/api.ts`. Shared HTTP configuration shall live in `src/lib/api.ts` or equivalent.

The frontend shall read these Vite environment variables:

- `VITE_AUTH_API_BASE_URL`
- `VITE_AUTH_API_KEY`
- `VITE_AUTH_APPLICATION_ID`

Auth requests shall attach required headers centrally. Components and hooks shall call typed functions such as `signIn`, `signUp`, `requestPasswordRecovery`, and `resetPassword` instead of using `fetch` directly.

## Consequences

- Backend contract changes are localized.
- Header handling is consistent across auth flows.
- Tests can mock the auth API module rather than browser networking.
- API key exposure remains a known limitation of browser clients and must be treated as application identification, not a secret.
