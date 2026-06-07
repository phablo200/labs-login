# Plan: Cypress Testing Strategy

## Source Documents

- Spec: `docs/specs/0010-testing-strategy.md`
- ADR: `docs/adrs/0010-testing-strategy-for-auth-frontend.md`
- Project instructions: `.codex/instructions.md`
- SRS: `docs/SRS.md`
- UI guidelines: `docs/UI_GUIDELINES.md`

## Goal

Add Cypress browser coverage for the auth frontend without requiring a running
`auth-service`. The suite should validate critical auth workflows through the
same routes, forms, session helper, i18n behavior, and auth API boundary used by
the app.

## Decisions Confirmed

- Use Cypress only for automated tests in this phase.
- Do not add Vitest, React Testing Library, Jest, or unit tests.
- Mock the auth backend with `cy.intercept`; the default automated path must not
  require `auth-service`, seeded data, CORS setup, or external OAuth providers.
- Keep test-only helpers under `cypress/`.
- Keep production code changes limited to stable selectors only when semantic
  selectors are not reliable enough.
- Use non-secret Vite e2e configuration values.
- Continue running the existing quality gates: `npm run lint`,
  `npm run typecheck`, and `npm run build`.

## Current State

- Package scripts currently include `dev`, `build`, `lint`, `typecheck`, and
  `preview`; there are no Cypress scripts.
- Auth API calls are centralized in `src/features/auth/api.ts` and use
  `src/lib/api.ts`.
- Auth API endpoints currently used by the frontend:
  - `POST /auth/signin`
  - `POST /auth/signup`
  - `POST /auth/forgot-password`
  - `PATCH /auth/reset-password`
  - `GET /auth/validate-token`
  - `GET /auth/oauth/providers`
  - `POST /auth/oauth/:provider/authorize`
  - `POST /auth/oauth/exchange`
- Shared request headers are produced by `requestJson`:
  - `Content-Type: application/json`
  - `accept-language`
  - `x-api-key`
  - `x-application-id`
  - `Authorization: Bearer <token>` when a token is supplied
- Session is temporarily stored in the `labs_login_session` cookie through
  `src/lib/session.ts`.
- Routes are centralized in `src/routes/routes.enum.ts`:
  - `/sign-in`
  - `/sign-up`
  - `/password-recovery`
  - `/reset-password`
  - `/signin/callback`
  - `/home`
- No Cypress configuration, support files, fixtures, or test specs exist yet.

## Implementation Steps

### 1. Add Cypress Foundation

Files:

- `package.json`
- `package-lock.json`
- `.env.e2e`
- `.gitignore`
- `cypress.config.ts`
- `cypress/support/e2e.ts`
- `cypress/support/commands.ts`
- `cypress/support/index.d.ts`

Tasks:

- Install dev dependencies:
  - `cypress`
  - `start-server-and-test`
  - `axe-core`
  - `cypress-axe`
- Add `.env.e2e` with non-secret values:

```bash
VITE_AUTH_API_BASE_URL=http://127.0.0.1:3001/api
VITE_AUTH_API_KEY=e2e-api-key
VITE_AUTH_APPLICATION_ID=e2e-application
```

- Add scripts:
  - `dev:e2e`: `vite --mode e2e --host 127.0.0.1 --port 5173 --strictPort`
  - `cypress:open`: open the Cypress runner
  - `cypress:run`: run Cypress headlessly
  - `test:e2e`: start `dev:e2e`, wait for Vite, then run Cypress
- Add `cypress.config.ts` with:
  - `e2e.baseUrl = 'http://127.0.0.1:5173'`
  - `specPattern = 'cypress/e2e/**/*.cy.ts'`
  - `supportFile = 'cypress/support/e2e.ts'`
  - deterministic desktop viewport defaults
  - CI-only retries
  - video disabled by default
  - Cypress env value for the auth API base URL when useful for explicit
    intercept URL construction
- Import `./commands` and `cypress-axe` from `cypress/support/e2e.ts`.
- Add typed custom command declarations in `cypress/support/index.d.ts`.
- Ignore generated Cypress screenshots and videos in `.gitignore`.

### 2. Build The Mock Auth Boundary

Files:

- `cypress/support/authResponses.ts`
- `cypress/support/commands.ts`
- optional `cypress/fixtures/auth/*.json`

Tasks:

- Add typed response factories for:
  - auth success `{ token, user }`
  - backend success `{ message }`
  - backend 4xx `{ error }`
  - empty or malformed responses
  - provider status responses
  - provider authorization responses
  - OAuth code exchange responses
  - token validation responses
- Add narrow custom commands only where they remove repeated setup:
  - set the `labs_login_session` cookie
  - clear auth/session state before each test
  - assert shared auth request headers
  - stub provider status for pages that render provider buttons
  - inject axe after navigation
- Keep intercepts visible inside specs when request payloads, routes, or response
  handling are central to the assertion.
- Assert every backend-bound request uses the configured e2e values:
  - `x-api-key: e2e-api-key`
  - `x-application-id: e2e-application`
  - `accept-language` matching the selected app language
- Prefer matching full endpoint URLs against `VITE_AUTH_API_BASE_URL`; use
  wildcard matching only when the test would otherwise become brittle for no
  added confidence.

### 3. Add Core Form Specs

Files:

- `cypress/e2e/auth/sign-in.cy.ts`
- `cypress/e2e/auth/sign-up.cy.ts`
- `cypress/e2e/auth/password-recovery.cy.ts`
- `cypress/e2e/auth/reset-password.cy.ts`

Tasks:

- Use labels, accessible names, visible text, and route assertions as the primary
  selectors.
- Add `data-testid` only for transient UI such as toasts if semantic selectors
  are too brittle.
- For each form, cover:
  - required field validation
  - field-specific validation
  - disabled submit/loading state while the request is pending
  - successful backend response
  - backend 4xx `{ error }` toast
  - backend 5xx fallback toast
  - network fallback toast
- Sign-in coverage must verify:
  - invalid email validation
  - successful redirect to `/home`
  - session cookie is written
- Sign-up coverage must verify:
  - password length validation
  - password mismatch validation
  - duplicate email backend error
  - `confirmPassword` is not included in the backend payload
  - successful redirect to `/home`
- Password recovery coverage must verify:
  - email validation
  - backend `{ message }` is shown on success
- Reset password coverage must verify:
  - missing `?token=` UI
  - password validation
  - request payload is `{ token, new_password }`
  - success toast
  - redirect back to sign-in

### 4. Add Routing And Session Specs

Files:

- `cypress/e2e/auth/protected-route.cy.ts`

Tasks:

- Cover anonymous navigation to `/home` redirecting to `/sign-in`.
- Cover a valid `labs_login_session` cookie causing token validation and allowing
  `/home` to render.
- Cover token validation 4xx/5xx/network failure clearing the session cookie and
  redirecting to `/sign-in`.
- Verify `GET /auth/validate-token` includes the bearer token from the cookie.
- Verify successful sign-in and sign-up flows use the session helper outcome,
  not local storage or scattered token writes.

### 5. Add Provider And OAuth Callback Specs

Files:

- `cypress/e2e/auth/providers.cy.ts`
- `cypress/e2e/auth/oauth-callback.cy.ts`

Tasks:

- Provider tests must cover:
  - Google and GitHub controls are visible.
  - Controls remain disabled when provider status fails.
  - Controls remain disabled when providers are missing or disabled.
  - Enabled providers call `POST /auth/oauth/:provider/authorize`.
  - Authorization request body contains `redirect_uri` for `/signin/callback`.
  - Successful authorization attempts browser navigation to
    `authorization_url`.
- OAuth callback tests must cover:
  - `status=success&code=<code>` exchanges the code with
    `POST /auth/oauth/exchange`.
  - Successful exchange writes the session cookie and redirects according to
    current frontend behavior.
  - Known `status=error&reason=<reason>` values show safe localized copy.
  - Unknown error reasons show the generic fallback.
  - Missing status or missing success code shows the generic fallback.
  - Exchange 4xx, 5xx, malformed response, and network failures show the
    expected fallback behavior.
- Never assert or introduce frontend-owned provider secrets, provider tokens, or
  direct Google/GitHub API calls.

### 6. Add Localization Coverage

Files:

- `cypress/e2e/auth/localization.cy.ts`

Tasks:

- Verify English copy on the primary auth pages.
- Switch to Portuguese and verify translated form labels, primary actions, and
  common validation/errors.
- Submit at least one backend request in each language and assert the
  `accept-language` header.
- Verify language changes before form submission affect the outgoing request.
- Keep assertions focused on user-visible copy that should be stable.

### 7. Add Accessibility And Responsive Smoke Coverage

Files:

- `cypress/e2e/auth/accessibility-responsive.cy.ts`

Tasks:

- Run axe against the critical auth pages:
  - `/sign-in`
  - `/sign-up`
  - `/password-recovery`
  - `/reset-password?token=e2e-token`
- Fail on critical and serious violations.
- Document intentional axe exclusions inline only when there is a concrete
  reason.
- Check at least one mobile viewport and one desktop viewport.
- Verify there is no horizontal document overflow.
- Verify primary fields and submit controls are reachable on mobile and desktop.
- Keep visual polish and full keyboard exploration as manual checks; do not turn
  Cypress into brittle screenshot testing.

### 8. Document Running The Suite

Files:

- `README.md` if it exists, otherwise a short testing note under `docs/`

Tasks:

- Document:
  - `npm run test:e2e`
  - `npm run cypress:open`
  - the mocked-backend default
  - the purpose of `.env.e2e`
  - first-install Cypress browser download expectations
- Do not document real backend execution as the default path.

## Expected Test File Layout

```text
cypress/
├── e2e/
│   └── auth/
│       ├── accessibility-responsive.cy.ts
│       ├── localization.cy.ts
│       ├── oauth-callback.cy.ts
│       ├── password-recovery.cy.ts
│       ├── protected-route.cy.ts
│       ├── providers.cy.ts
│       ├── reset-password.cy.ts
│       ├── sign-in.cy.ts
│       └── sign-up.cy.ts
└── support/
    ├── authResponses.ts
    ├── commands.ts
    ├── e2e.ts
    └── index.d.ts
```

## Acceptance Criteria

- [ ] `npm run test:e2e` starts Vite in e2e mode and runs Cypress headlessly.
- [ ] `npm run cypress:open` opens Cypress for local interactive debugging.
- [ ] The Cypress suite runs without a real `auth-service` process.
- [ ] Test env values are non-secret and loaded through Vite configuration.
- [ ] Sign-in tests cover validation, successful auth, session cookie, redirect,
  4xx error toast, 5xx fallback toast, and network fallback toast.
- [ ] Sign-up tests cover validation, successful auth, duplicate email error,
  session cookie, redirect, and omission of `confirmPassword` from the payload.
- [ ] Password recovery tests cover validation, success message, 4xx error, 5xx
  fallback, and network fallback.
- [ ] Reset password tests cover missing token, validation, `{ token,
  new_password }` payload, success toast, redirect, and backend failures.
- [ ] Protected-route tests cover anonymous redirect, valid token access, bearer
  token validation, invalid token cleanup, and failed validation cleanup.
- [ ] Localization tests verify English, Portuguese, and `accept-language`
  headers.
- [ ] Provider tests verify unavailable/disabled provider states and enabled
  provider authorization redirect initiation.
- [ ] OAuth callback tests verify success exchange, known errors, unknown errors,
  missing params, and exchange failures.
- [ ] Accessibility checks report no critical or serious axe violations on tested
  auth pages.
- [ ] Responsive smoke checks pass on mobile and desktop with no horizontal
  document overflow.
- [ ] `npm run lint`, `npm run typecheck`, `npm run build`, and
  `npm run test:e2e` pass after implementation.

## Validation Commands

Run after implementation:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Manual verification:

- Run `npm run dev`.
- Check sign in, sign up, password recovery, reset password, protected route,
  language switching, provider unavailable states, OAuth callback fallback
  handling, keyboard navigation, dark/light mode, and responsive layout polish.

## Risks And Mitigations

- Risk: Cypress tests become brittle by targeting CSS classes or component
  internals.
  - Mitigation: Prefer labels, accessible names, routes, request payloads,
    headers, cookies, and user-visible outcomes.
- Risk: Mocked responses drift from backend contracts.
  - Mitigation: Centralize response factories and align them with SRS and auth
    API types.
- Risk: OAuth behavior changes while the backend contract is still maturing.
  - Mitigation: Keep tests focused on the current backend-owned authorization
    and exchange boundary.
- Risk: Accessibility checks fail on low-impact or third-party markup.
  - Mitigation: Gate on critical/serious axe impacts and document any targeted
    exclusions inline.
- Risk: Cypress installation is slow in constrained environments.
  - Mitigation: Keep Cypress as a dev dependency and document first-install
    browser download expectations.
- Risk: `start-server-and-test` leaves a Vite process running after an
  interrupted local run.
  - Mitigation: Use strict port binding and document cleanup only if it becomes
    a recurring local issue.

## Open Questions

- Which browser should CI use when Cypress is later wired into pull requests?
- Should CI retain screenshots or videos for failed Cypress runs, or keep local
  runs artifact-free until a CI plan exists?
