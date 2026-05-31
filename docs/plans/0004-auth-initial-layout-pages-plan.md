# Plan: Auth Initial Layout Pages

## Source Documents

- Spec: `docs/specs/0004-auth-initial-layout-pages.md`
- SRS: `docs/SRS.md`
- UI guidelines: `docs/UI_GUIDELINES.md`
- ADR: `docs/adrs/0002-use-feature-based-frontend-architecture.md`
- ADR: `docs/adrs/0003-use-react-router-and-pages.md`
- ADR: `docs/adrs/0009-disable-provider-login-until-backend-contract-exists.md`
- Project instructions: `.codex/instructions.md`

## Decisions Confirmed

- Implement initial layouts for:
  - `src/pages/SignInPage/SignInPage.tsx`
  - `src/pages/SignUpPage/SignUpPage.tsx`
  - `src/pages/PasswordRecoveryPage/PasswordRecoveryPage.tsx`
- Use reusable auth components under `src/features/auth/components`.
- Include password visibility toggles in this first layout implementation.
- Keep primary submit buttons disabled until backend integration exists.
- Use `src/assets/hero.png` as the temporary brand-panel visual until final branding is selected.
- Keep Google and GitHub provider buttons visible but disabled.
- Keep all internal navigation targets using `AppRoute`.
- Do not implement React Hook Form, Zod, i18next, Sonner, auth API calls, session persistence, route guards, or reset-password layout changes in this plan.

## Current State

The app currently has route-level placeholder pages:

```text
src/pages/
├── PasswordRecoveryPage/
│   └── PasswordRecoveryPage.tsx
├── SignInPage/
│   └── SignInPage.tsx
└── SignUpPage/
    └── SignUpPage.tsx
```

Routing is already centralized in:

```text
src/routes/
├── router.tsx
└── routes.enum.ts
```

Existing placeholder styles live in `src/App.css`, and base tokens live in `src/index.css`.

## Implementation Steps

### 1. Add Auth Layout Component

- Create `src/features/auth/components/AuthLayout/AuthLayout.tsx`.
- Use a folder-per-component structure and no barrel export.
- Accept props for:
  - `title`
  - `subtitle`
  - `children`
  - optional `footer`
  - optional `showProviders` if provider placement is owned by the layout
- Render:
  - a desktop split layout at `1024px` and wider
  - a warm brand panel using `src/assets/hero.png`
  - a compact mobile brand header above the form
  - a constrained form column with max width near `420px`
- Keep the layout semantic with a single `main` landmark and route-specific `aria-labelledby`.

### 2. Add Password Field Component

- Create `src/features/auth/components/PasswordField/PasswordField.tsx`.
- Render a labeled password input with:
  - visibility toggle button
  - accessible toggle label
  - stable input height
  - correct `autocomplete`
  - optional helper text slot if needed later
- Keep the component uncontrolled for this layout phase so React Hook Form can own value registration later.
- Use local component state only for visibility.

### 3. Add Provider Buttons Component

- Create `src/features/auth/components/ProviderButtons/ProviderButtons.tsx`.
- Render disabled Google and GitHub buttons.
- Use clear disabled copy or helper text explaining that provider login is unavailable until backend OAuth exists.
- Ensure disabled buttons do not submit forms, navigate, or call handlers.
- Prefer text labels for provider names in this phase; add icons only if the project already has an icon dependency at implementation time.

### 4. Update Sign-In Page

- Replace placeholder content in `src/pages/SignInPage/SignInPage.tsx`.
- Use `AuthLayout`.
- Render a form shell with disabled submit behavior:
  - email field with `type="email"` and `autocomplete="email"`
  - password field with `autocomplete="current-password"`
  - disabled primary button labeled for sign in
  - forgot-password link to `AppRoute.PasswordRecovery`
  - create-account link to `AppRoute.SignUp`
  - disabled provider buttons
- Prevent default form submission defensively even though the primary action is disabled.

### 5. Update Sign-Up Page

- Replace placeholder content in `src/pages/SignUpPage/SignUpPage.tsx`.
- Use `AuthLayout`.
- Render a form shell with disabled submit behavior:
  - name field with `autocomplete="name"`
  - email field with `type="email"` and `autocomplete="email"`
  - password field with `autocomplete="new-password"`
  - confirm password field with `autocomplete="new-password"`
  - disabled primary button labeled for account creation
  - sign-in link to `AppRoute.SignIn`
  - disabled provider buttons
- Do not add password validation messaging yet.

### 6. Update Password Recovery Page

- Replace placeholder content in `src/pages/PasswordRecoveryPage/PasswordRecoveryPage.tsx`.
- Use `AuthLayout`.
- Render a form shell with disabled submit behavior:
  - email field with `type="email"` and `autocomplete="email"`
  - disabled primary button labeled for recovery request
  - sign-in link to `AppRoute.SignIn`
- Use safe copy that does not reveal account existence.
- Do not add success message, backend call, or toast behavior.

### 7. Replace Placeholder CSS

- Update `src/App.css` with scoped auth layout styles.
- Remove or stop relying on `.route-page`, `.route-eyebrow`, `.route-copy`, and `.route-links` for these auth pages if they are no longer used.
- Add styles for:
  - split auth shell
  - brand panel
  - hero image treatment
  - form panel
  - labels, inputs, password toggle, helper text
  - primary disabled button
  - secondary links
  - disabled provider buttons
  - mobile single-column layout
- Keep root and token changes in `src/index.css` minimal and aligned with `docs/UI_GUIDELINES.md`.

### 8. Preserve Route Boundaries

- Do not change `src/routes/router.tsx` unless imports need adjustment.
- Do not change `src/routes/routes.enum.ts` unless a missing route constant is discovered.
- Keep route-level pages responsible for choosing page copy and form fields.
- Keep reusable auth visual structure in feature components.

### 9. Manual Accessibility Pass

- Confirm each input has a visible label.
- Confirm password toggle buttons have accessible names.
- Confirm tab order is predictable.
- Confirm disabled controls are understandable and do not trap focus.
- Confirm focus states are visible in light and dark mode.
- Confirm mobile widths do not clip or overlap text.

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

- `/sign-in`
- `/sign-up`
- `/password-recovery`

Confirm:

- Each route renders the new auth layout.
- Desktop widths at `1024px` and above show a split layout.
- Mobile width around `390px` shows a single-column flow.
- `src/assets/hero.png` appears only in the brand panel and does not compete with form readability.
- Sign-in and sign-up show disabled Google/GitHub provider buttons.
- Primary submit buttons are disabled until backend integration.
- Password visibility toggles work without submitting the form.
- Internal links navigate through `AppRoute` values.
- Dark mode remains readable.

## Completion Criteria

- `AuthLayout` exists under `src/features/auth/components/AuthLayout/`.
- `PasswordField` exists under `src/features/auth/components/PasswordField/`.
- `ProviderButtons` exists under `src/features/auth/components/ProviderButtons/`.
- `SignInPage`, `SignUpPage`, and `PasswordRecoveryPage` no longer render placeholder copy.
- The three pages use the shared auth layout.
- Submit buttons remain disabled.
- Provider buttons remain disabled.
- `hero.png` is used for the temporary brand panel.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass.

## Deferred Work

- React Hook Form and Zod validation.
- Auth API integration in `src/features/auth/api.ts`.
- i18next locale resources and language switcher.
- Sonner toast host and auth notification behavior.
- Cookie-backed session helper and authenticated redirects.
- Route guards.
- Reset password layout and submission flow.
- OTP login.
- Final brand illustration.
- Automated component tests after Vitest and React Testing Library are configured.

## Risks and Mitigations

- Risk: Disabled primary buttons may look like a broken form.
  - Mitigation: Use concise helper copy near the action area indicating backend integration is pending, and remove it when API behavior is implemented.

- Risk: Password visibility toggles may add state that conflicts with future React Hook Form registration.
  - Mitigation: Keep the field uncontrolled and limit component state to input `type`.

- Risk: The temporary hero image may not match the final brand direction.
  - Mitigation: Isolate image usage in `AuthLayout` so the asset can be replaced without touching page implementations.

- Risk: Auth layout CSS may affect home or not-found pages.
  - Mitigation: Scope styles with auth-specific class names and leave generic route styles alone unless proven unused.
