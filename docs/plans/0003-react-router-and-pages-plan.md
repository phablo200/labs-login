# Plan: React Router and Page Components

## Source Documents

- Spec: `docs/specs/0003-react-router-and-pages.md`
- ADR: `docs/adrs/0003-use-react-router-and-pages.md`
- Routing skill: `.codex/skills/labs-login-router/SKILL.md`
- Project instructions: `.codex/instructions.md`
- Previous plan: `docs/plans/0002-feature-based-frontend-architecture-plan.md`

## Decisions Confirmed

- Keep React Router as the client-side routing layer.
- Store all shared route strings in `src/routes/routes.enum.ts`.
- Use `AppRoute` as the shared enum name.
- Move route declarations to `src/routes/router.tsx`.
- Keep `src/main.tsx` responsible for mounting the root React app and routing context.
- Use route-level page components under `src/pages`.
- `/` redirects to `/sign-in`.
- `/home` renders a minimal placeholder page.
- Do not implement route guards, backend auth calls, session persistence, final auth forms, i18n, toasts, or final labs-login visuals in this plan.

## Current State

The app currently has:

```text
src/
├── App.css
├── App.tsx
├── assets/
├── components/
│   └── ui/
├── features/
│   └── auth/
│       └── types.ts
├── hooks/
├── index.css
├── lib/
├── main.tsx
├── pages/
│   └── StarterPage.tsx
└── vite-env.d.ts
```

`react-router-dom` is already listed in `package.json`, but `src/App.tsx` still renders `StarterPage` directly and no route table exists yet.

## Implementation Steps

### 1. Verify React Router Dependency

- Confirm `react-router-dom` is present in `package.json` and `package-lock.json`.
- If missing, install it as a runtime dependency.
- Do not change unrelated dependencies.

### 2. Add Shared Route Enum

- Create `src/routes/`.
- Create `src/routes/routes.enum.ts`.
- Define route strings in `AppRoute`:
  - `Root = '/'`
  - `SignIn = '/sign-in'`
  - `SignUp = '/sign-up'`
  - `PasswordRecovery = '/password-recovery'`
  - `ResetPassword = '/reset-password'`
  - `Home = '/home'`
  - `NotFound = '*'`
- Remove `src/routes/.gitkeep` if real files now make it unnecessary.

### 3. Add Route-Level Pages

- Add minimal placeholder pages under `src/pages`:
  - `SignInPage.tsx`
  - `SignUpPage.tsx`
  - `PasswordRecoveryPage.tsx`
  - `ResetPasswordPage.tsx`
  - `HomePage.tsx`
  - `NotFoundPage.tsx`
- Keep copy explicit that auth UI is temporary where forms are not implemented yet.
- Avoid adding final UI design, form validation, backend calls, provider login behavior, or session logic.

### 4. Handle Reset Password Token

- In `ResetPasswordPage.tsx`, use React Router query-string APIs to read `?token=<token>`.
- Render a safe missing-token placeholder when no token is present.
- Render a safe token-present placeholder when a token is present.
- Do not validate or submit the token to the backend in this plan.

### 5. Create Router Module

- Create `src/routes/router.tsx`.
- Define the route tree using React Router components.
- Use `AppRoute` enum values for every route path and redirect target.
- Configure these behaviors:
  - `AppRoute.Root` redirects to `AppRoute.SignIn`.
  - `AppRoute.SignIn` renders `SignInPage`.
  - `AppRoute.SignUp` renders `SignUpPage`.
  - `AppRoute.PasswordRecovery` renders `PasswordRecoveryPage`.
  - `AppRoute.ResetPassword` renders `ResetPasswordPage`.
  - `AppRoute.Home` renders `HomePage`.
  - `AppRoute.NotFound` renders `NotFoundPage`.
- Do not hardcode route strings in route definitions.

### 6. Wire App and Root Rendering

- Update `src/App.tsx` to render the router module instead of `StarterPage`.
- Ensure `src/main.tsx` mounts the routing context at the application root.
- Keep the existing explicit `#root` null check.
- Keep `StrictMode`.

### 7. Clean Up Starter Artifacts

- Remove `StarterPage.tsx` if it is no longer referenced.
- Remove starter-only imports and assets only if they become unused.
- Avoid broad CSS redesign; keep styling cleanup limited to code made unreachable by this routing change.

### 8. Add Navigation Usage Where Helpful

- Use `Link` or `NavLink` for placeholder cross-links only when they clarify route verification.
- Use `AppRoute` enum values for all `to` values.
- Do not introduce imperative navigation except where a route behavior requires it.

### 9. Update Documentation If Needed

- Update documentation only when implementation choices differ from the spec or project instructions.
- Keep docs scoped to routing and page boundaries.

## Verification

Run:

```bash
npm run typecheck
npm run lint
npm run build
```

Manual check:

```bash
npm run dev
```

Visit:

- `/`
- `/sign-in`
- `/sign-up`
- `/password-recovery`
- `/reset-password`
- `/reset-password?token=test-token`
- `/home`
- `/unknown-route`

Confirm:

- `/` redirects to `/sign-in`.
- Each known route renders its page placeholder.
- `/reset-password` without a token does not crash.
- `/reset-password?token=test-token` reads the token state safely.
- Unknown routes render the not-found page.
- No route renders a blank page.
- No browser console errors appear during navigation.

## Completion Criteria

- `src/routes/routes.enum.ts` exists and exports `AppRoute`.
- Route definitions use `AppRoute` instead of hardcoded route strings.
- `src/routes/router.tsx` owns route declarations.
- `src/App.tsx` no longer renders `StarterPage` directly.
- Initial route-level pages exist under `src/pages`.
- `/` redirects to `/sign-in`.
- `/reset-password` handles both token-present and token-missing states.
- Unknown routes render a not-found page.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass.

## Deferred Work

- Final labs-login auth screen design from `docs/UI_GUIDELINES.md`.
- Auth forms, validation, and backend calls.
- Route guards and authenticated redirects.
- Session persistence and token validation.
- i18next copy extraction.
- Sonner toast integration.
- Provider login buttons and disabled OAuth state.
- Automated route tests once the test framework is configured.

## Risks and Mitigations

- Risk: Route placeholders may be mistaken for finished auth screens.
  - Mitigation: Keep placeholder copy minimal and temporary.

- Risk: Adding guards too early can create redirect loops.
  - Mitigation: Keep guards out of this plan and defer them until session state is implemented.

- Risk: Hardcoded route strings can drift from router definitions.
  - Mitigation: Require all paths and navigation targets to use `AppRoute`.

- Risk: Removing starter files may delete assets still imported elsewhere.
  - Mitigation: Check imports before deleting starter assets or CSS.
