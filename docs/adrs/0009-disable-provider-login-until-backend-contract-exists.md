# ADR 0009: Disable Provider Login Until Backend Contract Exists

## Status

Accepted

## Date

2026-05-30

## Context

The SRS requires Google and GitHub login options. The existing backend does not currently expose OAuth endpoints for Google or GitHub. Implementing provider OAuth directly in the frontend would expose responsibilities and secrets that belong on the backend.

## Decision

The frontend shall render Google and GitHub provider login buttons, but they shall remain disabled until backend-owned OAuth routes are available.

The UI shall communicate the unavailable state without attempting a failing network request. No OAuth provider secret, client secret, or token exchange logic shall be implemented in frontend code.

When backend routes are available, the frontend shall initiate provider login by redirecting to backend-owned endpoints or calling a documented backend OAuth initiation endpoint.

## Consequences

- The UI reflects planned provider support without false behavior.
- OAuth security boundaries remain correct.
- Provider login cannot be accepted as complete until the backend contract exists.
- A future ADR or ADR amendment should record the final OAuth route contract.
