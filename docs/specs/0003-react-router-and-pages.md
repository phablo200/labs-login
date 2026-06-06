# React Router and Page Components Spec

## Objective

- Introduce React Router as the client-side routing layer for labs-login.
- Define route-level page components under `src/pages` for the initial authentication and home routes required by ADR 0003 and `docs/SRS.md`.
- Preserve current app behavior where possible while preparing explicit URLs for later auth implementation.

## Background

- The app is a Vite React TypeScript project.
- `src/App.tsx` currently renders `StarterPage` directly.
- `src/pages/StarterPage.tsx` contains the starter Vite UI and is not connected to route definitions.
- ADR 0003 accepts React Router and requires route-level components in `src/pages`.
- The SRS requires routes for sign in, sign up, password recovery, reset password, and authenticated home navigation.

## Scope

### In Scope

- Install `react-router-dom`.
- Configure a browser router at the application root.
- Define initial routes:
  - `/`
  - `/sign-in`
  - `/sign-up`
  - `/password-recovery`
  - `/reset-password`
  - `/home`
- Add route-level page components under `src/pages`.
- Read the reset password token from `?token=<token>` on the reset password page.
- Add a simple not-found route for unknown URLs.
- Keep placeholder page content minimal and clearly temporary where auth UI is not implemented yet.

### Out of Scope

- Implementing complete sign-in, sign-up, password recovery, or reset password forms.
- Calling backend auth endpoints.
- Implementing session persistence or route guards.
- Implementing React Hook Form, Zod, i18next, Sonner, or provider login behavior.
- Replacing the visual starter UI with the final labs-login design.
- Adding full automated test coverage unless a test framework already exists.

## Proposed Approach

- Install `react-router-dom` as a runtime dependency.
- Keep `BrowserRouter` mounted in `src/main.tsx` so routing context is available to the whole app.
- Move route declarations into `src/App.tsx` using `Routes`, `Route`, and `Navigate`.
- Use `src/pages` for route-level components:
  - `SignInPage.tsx`
  - `SignUpPage.tsx`
  - `PasswordRecoveryPage.tsx`
  - `ResetPasswordPage.tsx`
  - `HomePage.tsx`
  - `NotFoundPage.tsx`
- Keep `StarterPage.tsx` temporarily available or map `/` to the most useful current route.
- Recommended route behavior for this spec:
  - `/` redirects to `/sign-in`.
  - `/sign-in`, `/sign-up`, `/password-recovery`, `/reset-password`, and `/home` render page placeholders.
  - `*` renders `NotFoundPage`.
- `ResetPasswordPage` shall use `useSearchParams` to read `token`.
- If the token is absent, the page shall display a non-blocking placeholder state explaining that a reset token is required. Full validation and backend calls are deferred.

Impacted files and directories:

- `package.json`
- `package-lock.json`
- `src/main.tsx`
- `src/App.tsx`
- `src/pages/*.tsx`
- `docs/plans/` if an implementation plan is created after review

## Milestones

1. Add `react-router-dom`.
2. Mount router provider in `src/main.tsx`.
3. Replace direct `StarterPage` rendering in `src/App.tsx` with route declarations.
4. Add initial route-level page components under `src/pages`.
5. Implement reset-token query reading in `ResetPasswordPage`.
6. Run typecheck, lint, build, and manual route verification.

## Edge Cases

- Direct browser navigation to nested routes must work with Vite dev server fallback.
- Unknown routes must not render a blank page.
- `/reset-password` without a token must not crash.
- Query strings must be preserved when reading `?token=<token>`.
- Future route guards must avoid redirect loops when session state is unknown.

## Acceptance Criteria

- [ ] `react-router-dom` is installed and listed in `package.json`.
- [ ] `src/main.tsx` mounts routing context for the app.
- [ ] `src/App.tsx` declares routes instead of rendering one page directly.
- [ ] `/` redirects to `/sign-in`.
- [ ] `/sign-in`, `/sign-up`, `/password-recovery`, `/reset-password`, and `/home` each render a route-level page from `src/pages`.
- [ ] `/reset-password?token=example` reads the token without crashing.
- [ ] `/reset-password` without a token shows a safe placeholder or missing-token state.
- [ ] Unknown routes render a not-found page.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass.

## Test Plan

- Unit: not required unless route helper logic is introduced.
- Integration: when a test framework exists, cover initial route rendering and reset-token query parsing.
- Manual verification:
  - Visit `/` and confirm redirect to `/sign-in`.
  - Visit `/sign-in`, `/sign-up`, `/password-recovery`, `/reset-password`, `/reset-password?token=test-token`, `/home`, and an unknown route.
  - Confirm no console errors during navigation.
  - Run `npm run typecheck`, `npm run lint`, and `npm run build`.

## Risks and Mitigations

- Risk: Placeholder pages may be mistaken for finished auth UI.
  - Mitigation: Keep copy explicit and minimal, and defer final UI to later specs.

- Risk: Adding route guards too early can create incorrect auth behavior.
  - Mitigation: Do not add protected routes until the session strategy from ADR 0008 is implemented.

- Risk: Starter page becomes unused.
  - Mitigation: Remove it only if no route uses it, or keep it temporarily until the final labs-login pages replace placeholders.

- Risk: Future i18n work may require changing placeholder copy.
  - Mitigation: Keep copy temporary and avoid hardcoding final user-facing content in this spec.

## Open Questions

- Should `StarterPage` remain available as a temporary `/starter` route, or be removed when placeholder auth pages are added?
- Should `/home` render the existing starter UI temporarily, or a minimal home placeholder? A minimal home placeholder.
- Should route definitions stay in `src/App.tsx`, or move to `src/lib/router.tsx` once routes grow? Move to src/lib/router.tsx.
