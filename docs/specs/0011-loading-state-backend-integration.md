# Spec: Loading State Backend Integration

## Objective

- Make backend-triggering frontend controls comply with `labs-integration-backend`: clicked async buttons become disabled, pending buttons render `LoadingIcon`, and backend calls remain isolated in feature `api.ts` modules.

## Background

- `src/components/ui/Icons/LoadingIcon.tsx` is currently a raw SVG document, not an exported React component, so it cannot be imported like the other icons.
- Auth form submit buttons already disable through React Hook Form `isSubmitting`, but they do not render a pending spinner.
- OAuth provider buttons disable during provider checks and redirect initiation, but they do not render `LoadingIcon` while checking or redirecting.
- Backend calls in `src` are already centralized through `src/features/auth/api.ts` and `src/lib/api.ts`; components do not call `fetch` directly.

## Scope

### In Scope

- Convert `LoadingIcon.tsx` into a typed React SVG component.
- Add loading icon rendering to sign in, sign up, password recovery, reset password, and provider-login pending buttons.
- Add CSS for stable spinner sizing and text alignment in auth buttons.
- Record the first `labs-integration-backend` audit result for `src`.

### Out of Scope

- Changing backend endpoint contracts.
- Adding new auth API methods.
- Implementing OAuth beyond the existing backend-owned provider flow.
- Adding a test runner.

## Proposed Approach

- Keep the spinner SVG path/animation and export `LoadingIcon` as a default React component accepting `SVGProps<SVGSVGElement>`.
- Import `LoadingIcon` in each backend-integrated auth page and in `ProviderButtons`.
- Preserve existing disabled behavior and add spinner markup only when `isSubmitting`, provider availability is loading, or a provider redirect is pending.
- Use existing API boundaries: auth calls stay in `src/features/auth/api.ts`; shared fetch/config/language/error handling stays in `src/lib/api.ts`.

Impacted files:

- `src/components/ui/Icons/LoadingIcon.tsx`
- `src/pages/SignInPage/SignInPage.tsx`
- `src/pages/SignUpPage/SignUpPage.tsx`
- `src/pages/PasswordRecoveryPage/PasswordRecoveryPage.tsx`
- `src/pages/ResetPasswordPage/ResetPasswordPage.tsx`
- `src/features/auth/components/ProviderButtons/ProviderButtons.tsx`
- `src/App.css`

## Milestones

1. Convert `LoadingIcon` to an importable component.
2. Add spinner rendering to backend-triggering pending buttons.
3. Run `labs-integration-backend` audit over `src` and fix any violations found.
4. Validate with lint and build.

## Edge Cases

- Provider availability loading should disable provider buttons and show loading state without starting OAuth.
- Provider redirect pending should disable both provider buttons while showing spinner only on the clicked provider.
- Submit buttons should preserve width and accessible text in English and Portuguese.
- Non-backend UI buttons, such as password visibility and language selection, do not need backend loading states.

## Acceptance Criteria

- [ ] `LoadingIcon.tsx` exports a typed React component.
- [ ] Every auth submit button shows `LoadingIcon` while `isSubmitting` is true.
- [ ] Provider buttons show `LoadingIcon` while provider availability is loading or while the clicked provider is redirecting.
- [ ] Backend calls in `src` remain isolated to `src/features/auth/api.ts` and shared `src/lib/api.ts`.
- [ ] No component or page calls `fetch` directly.
- [ ] `npm run lint` and `npm run build` pass.

## Test Plan

- Unit: Not added; no automated test runner setup is part of this change.
- Integration: Use lint/build to verify TSX imports, component typing, and production bundling.
- Manual verification: Submit auth forms and provider buttons in browser to confirm disabled/loading states and stable layout.

## Risks and Mitigations

- Risk: Loading text may grow in Portuguese and affect button layout.
  - Mitigation: Keep inline-flex layout, fixed minimum button heights, and compact icon sizing.
- Risk: Raw SVG conversion could lose animation.
  - Mitigation: Preserve the existing SVG paths and `animateTransform`.

## Open Questions

- None for this implementation.
