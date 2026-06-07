# Spec 0010: Cypress Testing Strategy for Auth Frontend

## Objective

- Add Cypress-based automated coverage for the auth frontend so the critical sign-in, sign-up, password recovery, reset-password, provider availability, localization, routing, and session behaviors can be validated through browser-driven tests.
- Make the test suite deterministic by mocking the auth backend at the network boundary instead of requiring a running `auth-service`.
- Align implementation with ADR 0010, which accepts Cypress for this phase and explicitly excludes Vitest, React Testing Library, and unit tests unless a future ADR supersedes it.

## Background

- The app already has route-level auth pages under `src/pages`, React Router setup under `src/routes`, centralized auth calls in `src/features/auth/api.ts`, shared HTTP/config behavior in `src/lib/api.ts` and `src/lib/config.ts`, i18next resources under `src/lib/i18n`, and temporary cookie-backed session helpers in `src/lib/session.ts`.
- There is currently no Cypress setup, no automated test files, and no package script for browser tests.
- The SRS still mentions unit/component/integration test categories, but ADR 0010 is the more specific accepted decision for this phase. The implementation shall follow ADR 0010 by using Cypress-only browser tests.
- Existing quality gates remain `npm run lint`, `npm run typecheck`, and `npm run build`.

## Scope

### In Scope

- Install and configure Cypress for end-to-end browser tests.
- Add deterministic test environment configuration for Vite using non-secret test values:
  - `VITE_AUTH_API_BASE_URL`
  - `VITE_AUTH_API_KEY`
  - `VITE_AUTH_APPLICATION_ID`
- Add package scripts for opening Cypress locally and running Cypress headlessly with the Vite dev server.
- Add Cypress support files, typed custom commands when useful, and backend response fixtures/factories for auth scenarios.
- Add Cypress tests for:
  - Sign in.
  - Sign up.
  - Password recovery.
  - Reset password.
  - Protected route/session validation.
  - Provider button unavailable/disabled behavior and backend-enabled provider redirect behavior where current code supports it.
  - OAuth callback handling for success and known error reasons.
  - English/Portuguese localization and `accept-language` request headers.
  - Practical responsive and accessibility checks.
- Update `.gitignore` for Cypress generated artifacts.
- Document how to run the suite locally.

### Out of Scope

- Adding Vitest, React Testing Library, Jest, or unit tests.
- Running tests against a real backend as the default automated path.
- Backend code changes in `auth-service`.
- Full visual regression testing with screenshot diffing.
- Exhaustive WCAG certification. Cypress accessibility checks are limited to practical automated rules plus manual verification.
- Implementing new OAuth provider behavior beyond what the frontend already exposes.

## Proposed Approach

- Add dev dependencies:
  - `cypress`
  - `start-server-and-test`
  - `axe-core`
  - `cypress-axe`
- Add `cypress.config.ts` with:
  - `e2e.baseUrl: 'http://127.0.0.1:5173'`
  - `specPattern: 'cypress/e2e/**/*.cy.ts'`
  - `supportFile: 'cypress/support/e2e.ts'`
  - predictable viewport defaults, retries for CI only, and generated video disabled unless needed later.
- Add `.env.e2e` with non-secret local test configuration:
  - `VITE_AUTH_API_BASE_URL=http://127.0.0.1:3001/api`
  - `VITE_AUTH_API_KEY=e2e-api-key`
  - `VITE_AUTH_APPLICATION_ID=e2e-application`
- Add package scripts:
  - `dev:e2e`: run Vite in `e2e` mode on `127.0.0.1:5173` with `--strictPort`.
  - `cypress:open`: open the Cypress runner.
  - `cypress:run`: run Cypress headlessly.
  - `test:e2e`: start `dev:e2e`, wait for the Vite URL, then run `cypress:run`.
- Add `cypress/support/e2e.ts` to import shared commands and `cypress-axe`.
- Add `cypress/support/commands.ts` for narrow helpers only where they remove duplication, such as:
  - stubbing provider status.
  - asserting required auth headers.
  - setting or clearing the `labs_login_session` cookie.
  - injecting axe after page load.
- Prefer semantic Cypress selectors through visible labels, roles, and button text. Add stable `data-testid` attributes only when semantic selectors are too brittle for toasts or non-text UI state.
- Use `cy.intercept` for every auth backend request so the suite does not depend on `auth-service` uptime, CORS, seed data, or external OAuth providers.
- Keep page components unaware of Cypress. Test-specific helpers stay under `cypress/`; production code changes should be limited to stable selectors only if needed.

Impacted files and directories:

- `package.json`
- `package-lock.json`
- `.env.e2e`
- `.gitignore`
- `cypress.config.ts`
- `cypress/e2e/auth/*.cy.ts`
- `cypress/fixtures/auth/*.json` or `cypress/support/authResponses.ts`
- `cypress/support/e2e.ts`
- `cypress/support/commands.ts`
- `cypress/support/index.d.ts`
- Optional production files only if stable selectors are required.

## Milestones

1. Cypress foundation
   - Install dev dependencies.
   - Add `cypress.config.ts`, `.env.e2e`, support files, and package scripts.
   - Ignore Cypress screenshots/videos.
   - Confirm `npm run test:e2e` can start Vite and open the app.
2. Auth mock layer
   - Add typed fixture/factory helpers for successful auth responses, `{ error }` 4xx responses, 5xx responses, network failures, provider status, token validation, and OAuth exchange.
   - Add shared assertions for `Content-Type`, `x-api-key`, `x-application-id`, and `accept-language`.
3. Core form flows
   - Add `sign-in.cy.ts`, `sign-up.cy.ts`, `password-recovery.cy.ts`, and `reset-password.cy.ts`.
   - Cover frontend validation, loading/disabled submit state, backend success, backend 4xx toasts, 5xx fallback toasts, and network fallback toasts.
4. Routing and session flows
   - Add `protected-route.cy.ts`.
   - Cover anonymous redirect to `/sign-in`, valid token validation rendering `/home`, invalid token clearing the session cookie, and successful sign-in/sign-up redirecting to `/home`.
5. Localization and provider flows
   - Add `localization.cy.ts`, `providers.cy.ts`, and `oauth-callback.cy.ts`.
   - Cover English/Portuguese copy, `accept-language` headers, provider disabled/unavailable states, enabled provider redirect initiation when backend status enables a provider, and OAuth callback success/error paths.
6. Accessibility and responsive smoke coverage
   - Add `accessibility-responsive.cy.ts` or include checks in each flow file.
   - Run axe checks for critical/serious violations on the main auth pages.
   - Verify mobile and desktop viewports do not create horizontal overflow and keep primary form controls reachable.
7. Verification and documentation
   - Run `npm run lint`.
   - Run `npm run typecheck`.
   - Run `npm run build`.
   - Run `npm run test:e2e`.
   - Update repository docs or README test notes if a README exists.

## Edge Cases

- Required Vite auth environment values are missing.
- Backend returns a 4xx response without an `error` field.
- Backend returns malformed JSON or an empty response for an endpoint expected to return JSON.
- Backend returns 500.
- Browser network request fails before receiving a response.
- Sign-up form must not send `confirmPassword`.
- Reset password route is opened without `?token=`.
- Reset password sends `new_password`, not `newPassword`.
- Selected language changes before form submission.
- Provider status request fails, returns an empty provider list, returns disabled providers, or returns only one enabled provider.
- Provider authorization succeeds with an `authorization_url`; the browser must attempt to navigate without exposing provider secrets in frontend code.
- OAuth callback receives missing `status`, `status=error` with a known reason, `status=error` with an unknown reason, `status=success` without a code, and `status=success` with a code exchange failure.
- Token validation request fails after a session cookie exists.
- Tests run in a clean browser context with no persisted cookies or language preference from earlier specs.

## Acceptance Criteria

- [ ] `npm run test:e2e` starts Vite in e2e mode and runs Cypress headlessly.
- [ ] `npm run cypress:open` opens Cypress for local interactive debugging.
- [ ] The Cypress suite runs without a real `auth-service` process.
- [ ] Test env values are non-secret and loaded through Vite configuration, not hardcoded in production modules.
- [ ] Sign-in tests cover required validation, invalid email validation, successful auth redirect/session cookie, backend 4xx `{ error }` toast, 5xx fallback toast, and network fallback toast.
- [ ] Sign-up tests cover required validation, password length, password mismatch, successful auth redirect/session cookie, duplicate-email backend error, and omission of `confirmPassword` from the backend payload.
- [ ] Password recovery tests cover email validation, success message from backend `{ message }`, backend 4xx toast, and service/network fallback toasts.
- [ ] Reset password tests cover missing token UI, password validation, success request payload `{ token, new_password }`, success toast, redirect to sign-in, and backend error handling.
- [ ] Protected-route tests cover anonymous redirect, valid token access to `/home`, and invalid token cleanup plus redirect.
- [ ] Localization tests verify English and Portuguese UI copy and request `accept-language` headers.
- [ ] Provider tests verify Google/GitHub controls are visible and disabled when provider support is unavailable or disabled by backend status.
- [ ] Provider tests verify the current backend-owned provider flow when backend status enables a provider, including authorization request payload and redirect URL handling.
- [ ] OAuth callback tests cover successful code exchange, known backend callback errors, unknown callback errors, and missing code/status handling.
- [ ] Accessibility checks report no critical or serious axe violations on tested auth pages.
- [ ] Responsive smoke checks pass for at least one mobile viewport and one desktop viewport with no horizontal document overflow.
- [ ] `npm run lint`, `npm run typecheck`, `npm run build`, and `npm run test:e2e` pass after implementation.

## Test Plan

- Unit:
  - None for this phase. ADR 0010 excludes unit tests for the auth frontend unless superseded.
- Cypress integration/e2e:
  - Run `npm run test:e2e` for the full mocked-backend browser suite.
  - Use `npm run cypress:open` for focused debugging during implementation.
  - Keep intercepts in each spec explicit enough that request URLs, payloads, headers, and response handling remain visible.
- Manual verification:
  - Run `npm run dev` and manually check sign in, sign up, password recovery, reset password, language switching, protected route behavior, provider unavailable states, keyboard navigation, dark/light mode presentation, and responsive layout polish.
  - Manual checks are still required for visual polish and exploratory behavior that should not be overfit into Cypress assertions.

## Risks and Mitigations

- Risk: Cypress tests become brittle if they target implementation details or CSS classes.
  - Mitigation: Prefer visible labels, accessible names, route assertions, request assertions, and user-visible outcomes.
- Risk: Mocked backend tests can drift from `auth-service`.
  - Mitigation: Centralize fixture/factory response shapes and keep them aligned with SRS endpoint contracts and backend ADRs.
- Risk: Provider login behavior is partially dependent on backend OAuth route maturity.
  - Mitigation: Treat unavailable/disabled provider behavior as required coverage and backend-enabled redirect behavior as coverage of the current documented frontend integration boundary.
- Risk: Accessibility checks create noisy failures for low-impact or third-party toast markup.
  - Mitigation: Gate on critical/serious axe impacts first and document any intentional exclusions with comments in the Cypress spec.
- Risk: `start-server-and-test` may leave a Vite process running after interrupted local runs.
  - Mitigation: Use the package script for normal runs and document manual cleanup only if this becomes recurring.
- Risk: Cypress browser downloads can slow installation in constrained environments.
  - Mitigation: Keep Cypress as a dev dependency and document that first install may take longer.

## Open Questions

- None blocking. A future CI task should decide which browser(s) run Cypress in pull requests and whether screenshots/videos should be retained as build artifacts.
