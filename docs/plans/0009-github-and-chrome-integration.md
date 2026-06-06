# Plan: GitHub And Google OAuth Integration

## Source Documents

- Spec: `docs/specs/0009-github-and-chrome-integration.md`
- SRS: `docs/SRS.md`
- UI guidelines: `docs/UI_GUIDELINES.md`
- Backend OAuth spec: `/home/danii/myProjects/auth-service/docs/specs/session-with-github-and-google.md`
- Backend OAuth plan: `/home/danii/myProjects/auth-service/docs/plans/session-with-github-and-google.md`
- Backend GitHub provider: `/home/danii/myProjects/auth-service/src/providers/github`
- Backend Google provider: `/home/danii/myProjects/auth-service/src/providers/google`
- Project instructions: `.codex/instructions.md`

This plan intentionally does not use `docs/specs/0008-session-management-with-cookies.md`; the HTTP-only cookie migration has been aborted for this rollout.

## Decisions Confirmed

- Keep OAuth authorization-code handling backend-owned.
- The frontend must not call Google or GitHub APIs directly.
- The frontend must not store or expose provider access tokens, refresh tokens, client secrets, or JWTs in callback URLs.
- Keep the current frontend bearer-token session model.
- Exchange the backend one-time OAuth code for the existing `{ token, user }` response.
- Persist the returned JWT only through the existing `src/lib/session.ts` abstraction.
- Continue validating protected routes with `Authorization: Bearer <token>`.
- Do not introduce backend-managed HTTP-only cookies or cookie-session behavior.
- Do not update ADR 0009 for this rollout.
- Align the frontend callback path with the backend allowlist: `/signin/callback`.
- Show a visible provider-login service-unavailable message on the sign-in page when provider status cannot be loaded.
- After successful OAuth exchange, show a success toast and redirect to the login route, currently `/sign-in`.
- Treat `chrome` in the filename as Google OAuth sign-in, not Chrome extension behavior.

## Current State

The frontend already has centralized auth API and token/session helpers:

```text
src/features/auth/api.ts
src/features/auth/types.ts
src/lib/api.ts
src/lib/session.ts
```

Provider buttons exist but are hard-disabled:

```text
src/features/auth/components/ProviderButtons/ProviderButtons.tsx
```

Routing is centralized in:

```text
src/routes/router.tsx
src/routes/routes.enum.ts
```

Existing auth pages use React Hook Form, Zod, i18next, Sonner-compatible auth toasts, and the shared auth layout. No OAuth callback page exists yet.

## Backend Contract

The frontend implementation depends on these backend routes under `VITE_AUTH_API_BASE_URL`:

- `GET /auth/oauth/providers`
  - Returns safe public provider metadata.
  - Expected shape: `{ providers: [{ provider: "google", enabled: true }, { provider: "github", enabled: true }] }`.

- `POST /auth/oauth/:provider/authorize`
  - Supported initial providers: `google`, `github`.
  - Request body: `{ "redirect_uri": "http://localhost:5173/signin/callback" }`.
  - Response body: `{ "authorization_url": "...", "expires_at": "..." }`.
  - Requires the normal auth headers through `requestJson`.

- `POST /auth/oauth/exchange`
  - Request body: `{ "code": "<one-time-exchange-code>" }`.
  - Response body: existing `{ token, user }` auth response.
  - Requires the normal auth headers through `requestJson`.

Backend callback redirects to the frontend callback route with either:

- Success: `/signin/callback?provider=<provider>&status=success&code=<exchange-code>`
- Error: `/signin/callback?provider=<provider>&status=error&reason=<safe-reason>`

## Implementation Steps

### 1. Add OAuth Types

Files:

- `src/features/auth/types.ts`

Tasks:

- Add `OAuthProvider` for the frontend-supported provider slugs:
  - `google`
  - `github`
- Add response and request types:
  - `OAuthProviderStatus`
  - `OAuthProvidersResponse`
  - `OAuthAuthorizeRequest`
  - `OAuthAuthorizeResponse`
  - `OAuthExchangeRequest`
  - `OAuthCallbackStatus`
  - `OAuthCallbackReason`
- Keep backend field names unchanged:
  - `redirect_uri`
  - `authorization_url`
  - `expires_at`
  - `code`
- Keep OAuth exchange success typed as the existing `SignInResponse`.
- Avoid adding provider token fields to frontend types.

### 2. Add OAuth API Functions

Files:

- `src/features/auth/api.ts`

Tasks:

- Add:
  - `getOAuthProviders(): Promise<OAuthProvidersResponse>`
  - `authorizeOAuthProvider(provider: OAuthProvider, request: OAuthAuthorizeRequest): Promise<OAuthAuthorizeResponse>`
  - `exchangeOAuthCode(request: OAuthExchangeRequest): Promise<SignInResponse>`
- Map endpoints exactly:
  - `GET /auth/oauth/providers`
  - `POST /auth/oauth/:provider/authorize`
  - `POST /auth/oauth/exchange`
- Use the existing `requestJson` helper.
- Do not add direct `fetch` calls in components.
- Confirm requests keep existing headers:
  - `Content-Type: application/json`
  - `x-api-key`
  - `x-application-id`
  - `accept-language`
- Do not log authorization URLs, callback codes, exchange responses, or tokens.

### 3. Add OAuth Callback Route

Files:

- `src/routes/routes.enum.ts`
- `src/routes/router.tsx`
- `src/pages/OAuthCallbackPage/OAuthCallbackPage.tsx`

Tasks:

- Add `AppRoute.OAuthCallback = '/signin/callback'`.
- Register `OAuthCallbackPage` in `src/routes/router.tsx`.
- Keep the route public because it is entered from the provider redirect.
- Use replace navigation when leaving the callback page so the exchange code is not retained in browser history as an active workflow.

### 4. Implement OAuth Callback Page

Files:

- `src/pages/OAuthCallbackPage/OAuthCallbackPage.tsx`

Tasks:

- Read query params through React Router search params:
  - `provider`
  - `status`
  - `code`
  - `reason`
- Render a small loading state while processing.
- If `status=success` and `code` exists:
  - call `exchangeOAuthCode({ code })`
  - call `saveSessionToken(response.token)`
  - show a localized success toast
  - navigate to `AppRoute.SignIn` with replace navigation
- If the callback is missing required success params:
  - show a localized generic OAuth error toast
  - navigate to `AppRoute.SignIn` with replace navigation
- If `status=error`:
  - map `reason` to localized safe copy
  - show the localized error toast
  - navigate to `AppRoute.SignIn` with replace navigation
- If exchange fails:
  - show the existing backend/network/service fallback toast behavior
  - navigate to `AppRoute.SignIn` with replace navigation
- Never persist the one-time exchange code beyond the immediate exchange request.
- Never write the callback code, authorization URL, token, or user payload to logs.

### 5. Add OAuth Toast And Reason Mapping

Files:

- `src/features/auth/toast.ts`
- `src/lib/i18n/locales/en.json`
- `src/lib/i18n/locales/pt.json`

Tasks:

- Add localized success copy for successful OAuth exchange.
- Add localized provider service-unavailable copy for provider-status failures.
- Add localized callback fallback copy for unknown/missing callback values.
- Add localized safe reason messages for:
  - `provider_not_supported`
  - `oauth_state_invalid`
  - `oauth_state_expired`
  - `oauth_code_exchange_failed`
  - `provider_email_unverified`
  - `oauth_account_conflict`
  - `oauth_exchange_invalid`
  - `oauth_exchange_expired`
  - `oauth_provider_error`
- For `oauth_account_conflict`, tell the user to sign in with email and password until account linking exists.
- Keep Portuguese strings concise enough for the existing auth layout.

### 6. Update Provider Buttons

Files:

- `src/features/auth/components/ProviderButtons/ProviderButtons.tsx`
- `src/App.css` if state styling changes are needed

Tasks:

- Replace hard-disabled behavior with provider-status driven state.
- On mount, call `getOAuthProviders()`.
- While loading provider status:
  - keep Google and GitHub buttons disabled
  - preserve the current layout dimensions
- If provider status fails:
  - keep buttons disabled
  - show visible localized service-unavailable copy in the provider area
- Enable Google only when the response includes `{ provider: "google", enabled: true }`.
- Enable GitHub only when the response includes `{ provider: "github", enabled: true }`.
- Ignore unknown provider slugs until a future UI spec adds them.
- On enabled provider click:
  - compute `redirect_uri` as `window.location.origin + AppRoute.OAuthCallback`
  - call `authorizeOAuthProvider(provider, { redirect_uri })`
  - disable the clicked button while the authorize request is pending
  - navigate with `window.location.assign(response.authorization_url)`
- On authorize failure:
  - keep the user on the sign-in page
  - show localized backend/network/service error copy
- Keep buttons `type="button"`.
- Preserve accessible button names and helper text.

### 7. Preserve Existing Auth And Bearer-Token Behavior

Files:

- `src/lib/session.ts`
- `src/routes/ProtectedRoute.tsx`
- `src/pages/SignInPage/SignInPage.tsx`
- `src/pages/SignUpPage/SignUpPage.tsx`
- `src/pages/PasswordRecoveryPage/PasswordRecoveryPage.tsx`
- `src/pages/ResetPasswordPage/ResetPasswordPage.tsx`

Tasks:

- Do not change the token persistence implementation for this OAuth rollout.
- Ensure OAuth exchange success uses `saveSessionToken` only.
- Ensure protected routes still validate using the bearer token.
- Confirm password sign-in and sign-up still redirect according to their existing behavior.
- Confirm password recovery and reset password toasts still use backend `{ message }` values.
- Keep OAuth success redirect to `/sign-in` per the resolved decision, even though password sign-in redirects to `/home`.

### 8. Add Focused Tests If Test Infrastructure Exists

Files:

- Near covered code, for example:
  - `src/features/auth/api.test.ts`
  - `src/features/auth/components/ProviderButtons/ProviderButtons.test.tsx`
  - `src/pages/OAuthCallbackPage/OAuthCallbackPage.test.tsx`

Tasks:

- If Vitest and React Testing Library are available, add focused tests.
- Test OAuth API endpoint and payload mapping.
- Test provider-status success enables only returned providers.
- Test provider-status failure leaves buttons disabled and shows service-unavailable copy.
- Test provider click sends `window.location.origin + AppRoute.OAuthCallback`.
- Test callback success exchanges the code, saves the token, shows success toast, and navigates to `/sign-in`.
- Test callback error reasons map to localized copy.
- Test unknown or missing callback params fall back safely.
- If no test runner is configured, document this as unverified and rely on lint, build, and manual checks.

### 9. Manual Verification

Prerequisites:

- Backend running with OAuth routes implemented.
- Frontend `.env` points at the backend through `VITE_AUTH_API_BASE_URL`.
- Backend allowlist includes `http://localhost:5173/signin/callback`.
- Google and/or GitHub OAuth provider env vars are configured in the backend for enabled-provider checks.

Manual checks:

- Start the frontend with `npm run dev`.
- Visit `/sign-in`.
- With providers not configured, confirm Google and GitHub remain disabled.
- With provider status endpoint unavailable, confirm a visible service-unavailable message appears in the provider area.
- With only Google enabled, confirm only Google is enabled.
- With only GitHub enabled, confirm only GitHub is enabled.
- Click Google and confirm the browser navigates to the backend-provided Google authorization URL.
- Complete the provider redirect and confirm the frontend lands on `/signin/callback`.
- Confirm the callback exchanges the one-time code, persists the returned JWT, shows a success toast, and redirects to `/sign-in`.
- Repeat the same flow for GitHub.
- Open `/home` after OAuth exchange and confirm protected route validation still uses `Authorization: Bearer <token>`.
- Open `/signin/callback?provider=github&status=error&reason=oauth_account_conflict` and confirm the localized conflict message.
- Confirm callback URLs never contain JWTs or provider tokens.
- Switch between English and Portuguese and confirm OAuth copy and the `accept-language` header align.

### 10. Final Verification

Run:

```bash
npm run lint
npm run build
```

Also run the project test command if a test runner exists when this plan is implemented.

## Completion Criteria

- `src/features/auth/types.ts` includes OAuth provider, provider-status, authorize, exchange, callback status, and callback reason types.
- `src/features/auth/api.ts` exports OAuth provider-status, authorize, and exchange functions.
- `ProviderButtons` enables Google and GitHub only from backend provider status.
- Provider-status failure shows a visible service-unavailable message on the sign-in page.
- `AppRoute.OAuthCallback` exists and uses `/signin/callback`.
- `OAuthCallbackPage` exchanges one-time codes and never stores callback codes.
- OAuth exchange success persists the JWT through `saveSessionToken`.
- OAuth exchange success shows a success toast and redirects to `/sign-in`.
- The implementation does not depend on `docs/specs/0008-session-management-with-cookies.md`.
- Callback errors map safe reason codes to localized user-facing copy.
- Existing password and recovery flows still work.
- No frontend source includes provider client secrets or direct Google/GitHub token handling.
- `npm run lint` passes.
- `npm run build` passes.

## Deferred Work

- Backend implementation changes.
- Explicit account-linking UI for `oauth_account_conflict`.
- Additional OAuth providers beyond Google and GitHub.
- Chrome extension authentication or browser extension APIs.
- Automatic redirect from `/sign-in` to `/home` for already-authenticated users.
- Comprehensive automated test setup if Vitest and React Testing Library are not already configured.

## Risks And Mitigations

- Risk: `/signin/callback` differs from the frontend's usual `/sign-in` route style.
  - Mitigation: use `/signin/callback` because it matches the backend allowlist for this rollout.

- Risk: Redirecting to `/sign-in` after successful exchange can look like a failed login.
  - Mitigation: show a success toast and leave any authenticated-public-route redirect as a separate explicit enhancement.

- Risk: Provider status failure can make provider login look unavailable without explanation.
  - Mitigation: show visible service-unavailable copy in the provider area.

- Risk: One-time exchange codes can be copied from callback URLs.
  - Mitigation: exchange immediately, navigate away with replace navigation, and rely on backend one-time short-lived code semantics.

- Risk: OAuth token handling can spread into UI components.
  - Mitigation: keep OAuth HTTP calls in `src/features/auth/api.ts` and token persistence in `src/lib/session.ts`.

- Risk: Unknown backend provider slugs appear in provider status.
  - Mitigation: ignore unknown slugs until matching UI, copy, and icons are specified.

- Risk: Existing password auth behavior regresses during provider-button changes.
  - Mitigation: manually verify sign-in, sign-up, recovery, reset password, and protected route validation after implementation.
