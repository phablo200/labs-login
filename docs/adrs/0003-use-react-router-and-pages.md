# ADR 0003: Use React Router and Page Components

## Status

Accepted

## Date

2026-05-30

## Context

The SRS requires multiple user flows, including sign in, sign up, password recovery, reset password links with query tokens, and redirecting authenticated users to `/home`. The application needs predictable route-level behavior but does not need a complex framework.

## Decision

The project shall use React Router for client-side routing. Route-level components shall live in `src/pages`.

Initial routes shall include:

- `/sign-in`
- `/sign-up`
- `/password-recovery`
- `/reset-password`
- `/home`

The reset password route shall read the recovery token from `?token=<token>`. Successful authentication shall navigate to `/home`.

## Consequences

- Auth flows have explicit URLs that are easy to link and test.
- Password reset links from the backend can land directly on the correct page.
- React Router becomes a required dependency.
- Route guards must be implemented carefully to avoid redirect loops when session state is unknown.
