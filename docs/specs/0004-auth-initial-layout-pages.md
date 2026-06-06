# Auth Initial Layout Pages Spec

## Objective

- Replace the temporary route placeholders for `SignInPage`, `SignUpPage`, and `PasswordRecoveryPage` with initial labs-login authentication layouts.
- Establish the reusable split-auth page structure, form shell, and page-specific field layouts required by `docs/UI_GUIDELINES.md`.
- Keep the implementation ready for later React Hook Form, Zod, i18next, Sonner, and auth API integration without implementing backend behavior in this step.

## Background

- The app is already migrated to TypeScript route-level pages under `src/pages`.
- `src/routes/router.tsx` already routes `/sign-in`, `/sign-up`, and `/password-recovery` to dedicated page components.
- The current `SignInPage`, `SignUpPage`, and `PasswordRecoveryPage` components render temporary placeholder copy and navigation links.
- `src/index.css` defines initial light/dark design tokens, and `src/App.css` contains minimal placeholder route styles.
- `docs/UI_GUIDELINES.md` requires a professional split-auth desktop layout, single-column mobile flow, accessible form states, labs-login branding, light/dark support, and visible disabled Google/GitHub provider buttons.
- The project has not yet installed or wired React Hook Form, Zod, i18next, Sonner, auth API calls, or session helpers.

## Scope

### In Scope

- Create an initial reusable auth layout for desktop and mobile authentication screens.
- Update `SignInPage`, `SignUpPage`, and `PasswordRecoveryPage` to use the layout.
- Render accessible, non-integrated form fields for:
  - Sign in: email and password.
  - Sign up: name, email, password, and confirm password.
  - Password recovery: email.
- Add page-specific titles, supporting copy, primary actions, and secondary navigation links.
- Show disabled Google and GitHub provider buttons on sign-in and sign-up pages only.
- Use existing route constants from `src/routes/routes.enum.ts` for all internal links.
- Use CSS tokens aligned with `docs/UI_GUIDELINES.md`, including dark-mode equivalents.
- Preserve mobile usability with a single-column layout and desktop split layout at `1024px` and above.

### Out of Scope

- Backend API calls for sign in, sign up, or password recovery.
- React Hook Form and Zod validation behavior.
- Sonner toast setup or success/error notification handling.
- i18next locale setup and translation files.
- Session persistence, route guards, token validation, or authenticated redirects.
- Password reset layout changes in `ResetPasswordPage`.
- OTP login UI.
- Real Google or GitHub OAuth behavior.
- Final custom illustration selection or AI-generated brand artwork.
- Automated test runner setup.

## Proposed Approach

- Add feature-specific auth layout components under `src/features/auth/components`:
  - `AuthLayout.tsx` for the split page frame, brand panel, form panel, and mobile brand header.
  - `ProviderButtons.tsx` for disabled Google/GitHub buttons with accessible unavailable text.
  - `PasswordField.tsx` if the password visibility toggle is included in the initial layout.
- Keep route-level page components under `src/pages/*Page/*Page.tsx` responsible for page composition only.
- Use standard semantic form markup with visible labels, autocomplete attributes, and accessible helper text, but prevent real submission until the auth integration spec is implemented.
- Prefer simple local JSX for initial fields instead of adding a general form abstraction before React Hook Form and Zod are introduced.
- Move placeholder route styling in `src/App.css` toward reusable auth layout classes or component-adjacent CSS according to the existing project pattern.
- Use `src/assets/hero.png` only if it fits the professional brand-panel direction; otherwise use a token-based warm brand panel with restrained non-interactive decorative elements until the final illustration decision is made.

Impacted files and directories:

- `src/pages/SignInPage/SignInPage.tsx`
- `src/pages/SignUpPage/SignUpPage.tsx`
- `src/pages/PasswordRecoveryPage/PasswordRecoveryPage.tsx`
- `src/features/auth/components/`
- `src/App.css`
- `src/index.css`
- `src/assets/` if an existing imported asset is used

## Milestones

1. Create reusable auth layout components under `src/features/auth/components`.
2. Update `SignInPage` with email/password layout, forgot-password link, create-account link, and disabled provider buttons.
3. Update `SignUpPage` with account creation fields, sign-in link, and disabled provider buttons.
4. Update `PasswordRecoveryPage` with recovery email layout and sign-in navigation.
5. Replace placeholder route CSS with responsive split-auth styling and dark-mode-safe tokens.
6. Run static and production checks, then manually verify desktop and mobile routes.

## Edge Cases

- Long Portuguese copy must fit within buttons, links, and form panels without overlapping or clipping.
- Disabled provider buttons must be focus behavior safe and must not trigger navigation or network calls.
- Password fields must use correct `autocomplete` values even before submission is implemented.
- Mobile layouts must show the form first and avoid hiding required navigation links.
- Dark mode must preserve readable contrast for labels, borders, helper text, disabled buttons, and brand panel copy.
- Direct visits to `/sign-in`, `/sign-up`, and `/password-recovery` must render without depending on prior app state.

## Acceptance Criteria

- [ ] `SignInPage`, `SignUpPage`, and `PasswordRecoveryPage` no longer show temporary placeholder copy.
- [ ] The three pages share a consistent auth layout with desktop split panel behavior at `1024px` and above.
- [ ] Mobile and narrow tablet views render as a single-column auth flow with compact labs-login branding above the form.
- [ ] Sign-in renders labeled email and password fields, a primary sign-in action, a forgot-password link, a sign-up link, and disabled Google/GitHub buttons.
- [ ] Sign-up renders labeled name, email, password, and confirm-password fields, a primary create-account action, a sign-in link, and disabled Google/GitHub buttons.
- [ ] Password recovery renders a labeled email field, a primary recovery action, and a sign-in link.
- [ ] All internal navigation uses `AppRoute` values instead of hardcoded route strings.
- [ ] Inputs have visible labels, useful `autocomplete` values, and visible focus states.
- [ ] Disabled Google/GitHub buttons clearly communicate that provider login is unavailable until backend OAuth exists.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass.

## Test Plan

- Unit: not required for this layout-only spec unless helper functions are introduced.
- Integration: defer component tests until the Vitest and React Testing Library setup exists.
- Manual verification:
  - Run `npm run dev`.
  - Visit `/sign-in`, `/sign-up`, and `/password-recovery`.
  - Check desktop layout at widths `1024px` and above.
  - Check mobile layout around `390px` width.
  - Confirm keyboard tab order reaches fields, links, primary actions, and any enabled controls predictably.
  - Confirm disabled provider buttons do not navigate or submit.
  - Confirm dark mode keeps text, borders, controls, and focus states readable.
- Static checks:
  - Run `npm run typecheck`.
  - Run `npm run lint`.
  - Run `npm run build`.

## Risks and Mitigations

- Risk: Layout components may become too coupled to the first three pages.
  - Mitigation: Keep `AuthLayout` responsible for page frame only and keep page-specific fields inside route pages or focused auth components.

- Risk: Static forms may be mistaken for complete authentication behavior.
  - Mitigation: Prevent real submission and defer validation, API calls, toasts, and redirects to the auth integration specs.

- Risk: Adding a final illustration too early may cause rework.
  - Mitigation: Use the existing asset only if it fits; otherwise keep the brand panel visually aligned through tokens and layout until the final asset is selected.

- Risk: CSS changes could affect non-auth routes.
  - Mitigation: Scope new styles to auth layout classes and avoid global typography or root changes unless required for tokens.

## Open Questions

- Should the first layout implementation include password visibility toggles now, or defer them to the React Hook Form/Zod validation implementation? Yes.
- Should the primary submit buttons be enabled with no-op prevented submissions for visual completeness, or disabled until API integration exists? Disabled Until backend integration.
- Should `src/assets/hero.png` be used as the initial brand-panel image, or should the first implementation stay asset-light until a final illustration is selected? Use this hero for now, until I get a proper brand.
