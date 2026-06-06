# Plan: Loading State Backend Integration

## Goal

Make backend-triggering controls follow `.codex/skills/labs-integration-backend/SKILL.md`:

- clicked async buttons become disabled
- pending backend buttons show `src/components/ui/Icons/LoadingIcon.tsx`
- backend API calls stay in feature `api.ts` files, with shared HTTP logic in `src/lib/api.ts`

## Current Findings

- `src/components/ui/Icons/LoadingIcon.tsx` must be a React component, not a raw SVG file.
- Auth form submit buttons already use React Hook Form `isSubmitting` to disable while pending.
- Auth form submit buttons still need `LoadingIcon` while `isSubmitting`.
- Provider buttons already disable while provider availability is loading or redirect initiation is pending.
- Provider buttons still need `LoadingIcon` while checking availability or redirecting.
- API placement already matches the skill: auth API methods live in `src/features/auth/api.ts`, and direct `fetch` is centralized in `src/lib/api.ts`.

## Implementation Steps

1. Convert `LoadingIcon.tsx`
   - Export a default typed React component.
   - Accept `SVGProps<SVGSVGElement>`.
   - Preserve the existing SVG paths and `animateTransform`.
   - Use `fill="currentColor"` so the spinner inherits button color.

2. Update auth submit buttons
   - Import `LoadingIcon` in:
     - `src/pages/SignInPage/SignInPage.tsx`
     - `src/pages/SignUpPage/SignUpPage.tsx`
     - `src/pages/PasswordRecoveryPage/PasswordRecoveryPage.tsx`
     - `src/pages/ResetPasswordPage/ResetPasswordPage.tsx`
   - Keep `disabled={isSubmitting}`.
   - Add `aria-busy={isSubmitting}`.
   - Render `LoadingIcon` when `isSubmitting` is true.
   - Keep the existing translated action label visible.

3. Update provider buttons
   - Import `LoadingIcon` in `src/features/auth/components/ProviderButtons/ProviderButtons.tsx`.
   - Treat buttons as busy when provider availability is loading or when that provider is redirecting.
   - Keep both provider buttons disabled while any provider redirect is pending.
   - Show the spinner on both provider buttons during availability loading.
   - Show the spinner only on the clicked provider during redirect.

4. Add stable loading styles
   - Add a gap to `.auth-form__submit`.
   - Add `.auth-form__submit-icon` with fixed width, height, and flex behavior.
   - Reuse `.auth-provider-button__icon` sizing for provider loading icons.

5. Run the first skill audit over `src`
   - Confirm components and pages do not call `fetch` directly.
   - Confirm backend calls are exposed through feature API methods.
   - Confirm backend-triggering buttons disable and show `LoadingIcon` while pending.
   - Confirm non-backend controls, such as password visibility and language selector buttons, are not incorrectly treated as backend integration buttons.

## Acceptance Criteria

- [x] `LoadingIcon.tsx` exports a typed React component.
- [x] Sign in submit button disables and shows `LoadingIcon` while pending.
- [x] Sign up submit button disables and shows `LoadingIcon` while pending.
- [x] Password recovery submit button disables and shows `LoadingIcon` while pending.
- [x] Reset password submit button disables and shows `LoadingIcon` while pending.
- [x] Provider buttons disable and show `LoadingIcon` during provider availability checks.
- [x] Clicked provider button shows `LoadingIcon` while redirect initiation is pending.
- [x] No component or page in `src` calls `fetch` directly.
- [x] Auth backend methods remain in `src/features/auth/api.ts`.
- [x] Shared request logic remains in `src/lib/api.ts`.

## Validation

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Manual checks:

- Submit each auth form and verify the clicked submit button is disabled with a spinner.
- Open provider login area and verify loading/unavailable states do not trigger failed auth attempts.
- Verify button text remains visible and does not overflow in English or Portuguese.

## Notes

- Do not add new backend endpoints in this work.
- Do not move token/session handling into components.
- Do not implement frontend-owned OAuth secrets or provider token exchange outside the existing backend-owned contract.
