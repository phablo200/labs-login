# ADR 0010: Testing Strategy for Auth Frontend

## Status

Accepted

## Date

2026-05-30

## Context

The SRS requires reliable validation, backend error handling, localization, routing, and session behavior. The current project has no automated test runner configured.

Tests were intentionally deferred until the core auth frontend behavior was clearer. The project still needs automated coverage, but the coverage should focus on the workflows that matter most across the frontend and backend boundary instead of adding many low-value unit tests.

Cypress is already familiar to the maintainer, has been used successfully before, and is trusted for this kind of browser-driven validation. That familiarity reduces setup and maintenance overhead while still giving confidence in the auth flows.

## Decision

The project shall adopt Cypress as the automated testing tool for the auth frontend.

The test strategy shall prioritize end-to-end and integration-style browser tests that exercise user-visible auth behavior, including:

- Sign in, sign up, password reset, and protected-route flows.
- Frontend validation and backend validation/error responses.
- Successful auth responses, 4xx errors, 5xx errors, and network failures.
- Localization, routing, session behavior, and disabled OAuth provider buttons.
- Critical responsive and accessibility checks that are practical to validate through Cypress.

The project shall not use unit tests for this phase. Vitest and React Testing Library are not part of the accepted testing strategy for the auth frontend unless this ADR is superseded.

Manual checks remain useful for visual polish, exploratory browser behavior, keyboard navigation, and responsive layout details that are not worth automating immediately.

## Consequences

- Automated coverage is aligned with the maintainer's strongest tool familiarity.
- Tests focus on realistic frontend and backend behavior instead of isolated implementation details.
- The project avoids overhead from broad unit test coverage that may not provide enough value for this application.
- Cypress adds a browser automation stack and related dev dependencies.
- Some low-level regressions may be caught later than they would be with unit tests, so Cypress scenarios must cover the critical auth paths carefully.
