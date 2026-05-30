# ADR 0008: Use Cookie-Backed Session Management

## Status

Accepted

## Date

2026-05-30

## Context

The SRS requires cookie-backed session persistence because this is a web application. The current backend returns JWT tokens in JSON responses and does not yet set backend-managed `HttpOnly` session cookies.

## Decision

The target architecture shall prefer backend-managed `HttpOnly`, `Secure`, `SameSite` cookies for authenticated sessions. Until the backend supports this contract, the frontend may temporarily store the returned JWT in a cookie through a narrow session helper in `src/lib/session.ts`.

The temporary frontend-managed cookie shall:

- Use `SameSite=Lax`.
- Use `Secure` in HTTPS environments.
- Use a bounded expiration aligned with the backend token lifetime.
- Be cleared on logout, invalid token detection, or failed token validation.

Application code shall read and write session state only through the session helper so the implementation can later switch to backend-managed cookies without broad refactoring.

## Consequences

- The architecture supports the desired secure end state.
- The current backend can still be integrated without blocking frontend implementation.
- Client-managed JWT cookies are a temporary security compromise because they are not `HttpOnly`.
- A backend change is required to reach the preferred production session model.
