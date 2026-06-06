# Spec 0009: GitHub And Google OAuth Integration

## Objective

- Enable the MeLogin frontend provider buttons for backend-owned Google and GitHub OAuth sign-in.
- Use the backend contract from `/home/danii/myProjects/auth-service/docs/specs/session-with-github-and-google.md` and `/home/danii/myProjects/auth-service/docs/plans/session-with-github-and-google.md`.
- Keep the current frontend bearer-token behavior: exchange the backend one-time OAuth code for `{ token, user }`, persist the returned JWT through the existing `src/lib/session.ts` abstraction, and continue sending authenticated requests with `Authorization: Bearer <token>`.
- Do not depend on `docs/specs/0008-session-management-with-cookies.md`; the HTTP-only cookie migration has been aborted for this rollout.
- Do not put OAuth provider secrets, provider tokens, or JWTs in frontend source code or callback URLs.

## Background

- `docs/SRS.md` requires Google and GitHub provider login options, but ADR 0009 previously required those buttons to stay disabled until a backend OAuth contract existed.
- The backend OAuth spec now defines that contract. The frontend can enable provider buttons only for providers returned by `GET /api/auth/oauth/providers`.
- The requested backend spec and plan are in the sibling backend repo, not this frontend repo:
  - `/home/danii/myProjects/auth-service/docs/specs/session-with-github-and-google.md`
  - `/home/danii/myProjects/auth-service/docs/plans/session-with-github-and-google.md`
- The requested provider implementations are also in the backend repo:
  - `/home/danii/myProjects/auth-service/src/providers/github`
  - `/home/danii/myProjects/auth-service/src/providers/google`
- The backend provider registry resolves configured slugs dynamically and currently registers:
  - `google`, implemented by `src/providers/google/provider.ts`
  - `github`, implemented by `src/providers/github/provider.ts`
- Google requests `openid email profile`, validates the ID token audience, uses `sub` as the provider user ID, and requires a verified email.
- GitHub requests `read:user user:email`, fetches the user profile and primary verified email, uses numeric `id` as the provider user ID, and requires a verified email.
- Current frontend provider buttons live in `src/features/auth/components/ProviderButtons/ProviderButtons.tsx` and are hard-disabled.
- Current frontend auth calls are centralized in `src/features/auth/api.ts` using `src/lib/api.ts`.
- Current frontend token persistence is centralized in `src/lib/session.ts`. This spec does not change that storage implementation and does not introduce HTTP-only cookie behavior.
- Current routes are centralized in `src/routes/routes.enum.ts` and wired in `src/routes/router.tsx`.

Assumption: the filename says `chrome`, but the backend spec, plan, and provider code define Google OAuth sign-in rather than a Chrome extension integration. This spec treats "Chrome" as the requested Google provider integration.

## Scope

### In Scope

- Add frontend types and API functions for the backend OAuth routes:
  - `GET /auth/oauth/providers`
  - `POST /auth/oauth/:provider/authorize`
  - `POST /auth/oauth/exchange`
- Add an OAuth callback route that matches the backend allowlisted local redirect target: `/signin/callback`.
- Enable Google and GitHub buttons only when provider status says the matching provider is enabled.
- Start provider sign-in by requesting an authorization URL from the backend and navigating the browser to it.
- Handle callback query states from the backend:
  - success with `provider`, `status=success`, and one-time `code`
  - error with `provider`, `status=error`, and safe `reason`
- Exchange a successful callback code for the existing `{ token, user }` auth response.
- Persist the returned token through `saveSessionToken`.
- After successful OAuth exchange, store the returned token, show a localized success toast, and redirect to `/sign-in` per stakeholder decision.
- Show a visible provider-login service-unavailable message on the sign-in page when provider status cannot be loaded.
- Show localized Sonner toasts for backend errors, callback reason codes, exchange failures, service failures, network failures, and OAuth exchange success.
- Preserve existing password, sign-up, password recovery, reset password, and protected-route behavior.
- Keep all OAuth frontend HTTP calls behind `src/features/auth/api.ts`.
- Keep all route strings in `src/routes/routes.enum.ts`.
- Add English and Portuguese copy for OAuth loading, unavailable, success, and error states.

### Out of Scope

- Backend implementation changes in `auth-service`.
- Backend database migrations, provider registry changes, or provider token exchange changes.
- Any session-storage migration, including backend-managed HTTP-only cookies.
- Provider account linking UI for existing same-email password accounts.
- Calling Google or GitHub APIs directly from the frontend.
- Storing provider access tokens or refresh tokens in the frontend.
- Adding a new auth state management library.
- Adding a new automated test runner if the project still has none when this spec is implemented.
- Chrome extension sign-in or browser extension APIs.

## Proposed Approach

- Treat the backend as the owner of the OAuth authorization-code flow. The frontend only asks the backend where to redirect, receives a one-time exchange code on callback, and exchanges that code for the same JWT response used by password sign-in.
- Treat this spec as independent from `docs/specs/0008-session-management-with-cookies.md`. OAuth success continues the existing bearer-token contract and does not require backend-managed cookies.
- Do not update ADR 0009 as part of this implementation. It was a quick-start decision while the backend contract was missing; this spec supersedes it for the OAuth rollout.
- Add OAuth request/response types to `src/features/auth/types.ts`:
  - `OAuthProvider = 'google' | 'github'`
  - `OAuthProviderStatus`
  - `OAuthProvidersResponse`
  - `OAuthAuthorizeRequest`
  - `OAuthAuthorizeResponse`
  - `OAuthExchangeRequest`
  - `OAuthCallbackStatus`
  - `OAuthCallbackReason`
- Add API functions to `src/features/auth/api.ts`:
  - `getOAuthProviders(): Promise<OAuthProvidersResponse>`
  - `authorizeOAuthProvider(provider: OAuthProvider, request: OAuthAuthorizeRequest): Promise<OAuthAuthorizeResponse>`
  - `exchangeOAuthCode(request: OAuthExchangeRequest): Promise<SignInResponse>`
- Use the existing `requestJson` helper so authorize and exchange requests include:
  - `Content-Type: application/json`
  - `x-api-key`
  - `x-application-id`
  - `accept-language`
- Keep `GET /auth/oauth/providers` behind the auth API module. It may use the existing headers even though the backend route is public, as long as the backend accepts extra safe headers.
- Add `AppRoute.OAuthCallback = '/signin/callback'` because the backend plan names `http://localhost:5173/signin/callback` as the first frontend allowlisted redirect URI.
- Add `src/pages/OAuthCallbackPage/OAuthCallbackPage.tsx` as the route-level callback handler.
- Callback page behavior:
  - Read `provider`, `status`, `code`, and `reason` from `window.location.search` through React Router search params.
  - If `status=success` and `code` is present, call `exchangeOAuthCode({ code })`.
  - On exchange success, call `saveSessionToken(response.token)`, show a localized success toast, and navigate to `/sign-in` with replace navigation.
  - This success redirect target intentionally differs from the earlier SRS `/home` post-auth redirect. If authenticated users should ultimately land on `/home`, implement that as a separate authenticated-public-route redirect behavior.
  - If status is error or required params are missing, show a localized toast and navigate to `/sign-in` with replace navigation.
  - Never log or persist the callback code beyond the immediate exchange request.
- Provider button behavior:
  - On render, fetch provider status once through `getOAuthProviders`.
  - While provider status is loading, keep buttons disabled and preserve layout dimensions.
  - If provider status cannot be loaded, keep provider buttons disabled and show a visible localized service-unavailable message in the sign-in page provider area.
  - Enable only providers with `{ provider: 'google' | 'github', enabled: true }`.
  - Keep unsupported providers hidden from this component unless a future provider button is explicitly designed.
  - On click, call `authorizeOAuthProvider(provider, { redirect_uri })`, where `redirect_uri` is `window.location.origin + AppRoute.OAuthCallback`.
  - Navigate with `window.location.assign(response.authorization_url)` after a successful authorize response.
  - Disable the clicked provider button while authorization is pending to prevent duplicate requests.
- Error handling:
  - Backend 4xx JSON errors still surface through the existing backend `error` toast behavior.
  - Callback safe reason codes map to localized copy. Initial required mappings:
    - `provider_not_supported`
    - `oauth_state_invalid`
    - `oauth_state_expired`
    - `oauth_code_exchange_failed`
    - `provider_email_unverified`
    - `oauth_account_conflict`
    - `oauth_exchange_invalid`
    - `oauth_exchange_expired`
    - `oauth_provider_error`
  - Unknown callback reasons use a localized generic OAuth fallback.
  - Network and 5xx exchange failures use the existing generic service/network fallback copy.
- Security constraints:
  - The frontend must never construct provider authorization URLs itself.
  - The frontend must never include Google or GitHub client secrets.
  - The frontend must never parse, decode, or store provider access tokens.
  - The frontend must never accept a JWT in the callback query string.
  - The one-time code is only read from the callback URL and posted to `/auth/oauth/exchange`.

Impacted frontend files:

- `src/features/auth/api.ts`
- `src/features/auth/types.ts`
- `src/features/auth/components/ProviderButtons/ProviderButtons.tsx`
- `src/features/auth/toast.ts` if additional helper mapping is useful
- `src/pages/OAuthCallbackPage/OAuthCallbackPage.tsx`
- `src/routes/routes.enum.ts`
- `src/routes/router.tsx`
- `src/lib/i18n/locales/en.json`
- `src/lib/i18n/locales/pt.json`
- `src/App.css` if provider loading/error/callback states need styling

## Milestones

1. Add OAuth frontend contract types
   - Add provider, provider-status, authorize, exchange, and callback reason types in `src/features/auth/types.ts`.
   - Keep backend input/output names aligned with the backend contract: `redirect_uri`, `authorization_url`, `expires_at`, and `code`.
   - Keep response user typing compatible with the existing `SignInResponse`.

2. Add OAuth API functions
   - Add `getOAuthProviders`, `authorizeOAuthProvider`, and `exchangeOAuthCode` to `src/features/auth/api.ts`.
   - Use existing `requestJson` behavior and central headers.
   - Confirm no component calls `fetch` directly for OAuth.

3. Add callback route and page
   - Add `AppRoute.OAuthCallback = '/signin/callback'`.
   - Register the route in `src/routes/router.tsx`.
   - Create `OAuthCallbackPage` with loading, success handoff, error handling, and replace navigation.
   - Persist returned JWTs only through `saveSessionToken`.
   - Show a localized success toast and redirect successful OAuth exchanges to `/sign-in`.

4. Enable provider buttons conditionally
   - Replace the hard-disabled `ProviderButtons` behavior with provider-status driven state.
   - Keep buttons disabled while loading, while unsupported, or while a provider authorize request is pending.
   - Show a visible localized service-unavailable message when provider status cannot be loaded.
   - Use the backend authorization URL response for browser navigation.
   - Preserve accessible names, disabled affordances, and helper copy.

5. Add localized copy and toast mappings
   - Add English and Portuguese strings for OAuth unavailable, provider loading, redirecting, callback success, callback failure, and safe backend reason codes.
   - Ensure copy fits the existing auth layout and provider button dimensions.
   - Reuse Sonner for user-visible errors and success handoff notices where helpful.

6. Preserve bearer-token protected-route behavior
   - Confirm OAuth exchange persists the token with `src/lib/session.ts`.
   - Confirm `/home` validation continues to use `Authorization: Bearer <token>`.
   - Confirm sign-in, sign-up, password recovery, reset password, logout, and invalid-token clearing still behave as before.
   - Confirm the chosen OAuth success redirect target is `/sign-in`, not `/home`.

7. Verification pass
   - Run `npm run lint`.
   - Run `npm run build`.
   - Manually verify disabled, enabled, callback success, callback error, and exchange failure states.

## Edge Cases

- Provider status endpoint is unavailable.
- Provider status returns only Google enabled.
- Provider status returns only GitHub enabled.
- Provider status returns an enabled provider not implemented by this frontend.
- Provider status returns malformed data.
- User clicks a provider button twice before navigation starts.
- Authorize endpoint returns `provider_not_supported`.
- Authorize endpoint rejects an unallowlisted `redirect_uri`.
- Callback is opened with no query params.
- Callback is opened with `status=success` but no `code`.
- Callback is opened with `status=error` and a known `reason`.
- Callback is opened with `status=error` and an unknown `reason`.
- Callback exchange code is expired or already used.
- Callback exchange code belongs to a different `x-application-id`.
- Exchange succeeds but token validation later fails in `ProtectedRoute`.
- User navigates back to the callback URL after a successful exchange.
- User returns to `/sign-in` after successful OAuth exchange while already holding a stored session token.
- Browser storage is unavailable or the existing frontend token persistence fails.
- Backend continues to use `/signin/callback` while the frontend otherwise uses `/sign-in`.
- Portuguese labels expand more than English labels in provider buttons and helper text.

## Acceptance Criteria

- [ ] `src/features/auth/api.ts` exports OAuth provider-status, authorize, and exchange functions.
- [ ] Auth pages and provider components do not call `fetch` directly for OAuth.
- [ ] `GET /auth/oauth/providers` controls which provider buttons can be enabled.
- [ ] Google remains disabled when the backend does not report `{ provider: 'google', enabled: true }`.
- [ ] GitHub remains disabled when the backend does not report `{ provider: 'github', enabled: true }`.
- [ ] Enabled provider buttons call `POST /auth/oauth/:provider/authorize` with `{ redirect_uri }`.
- [ ] Authorize requests include `x-api-key`, `x-application-id`, and `accept-language`.
- [ ] The frontend redirects the browser only to the backend-provided `authorization_url`.
- [ ] The OAuth callback route exists at `/signin/callback`.
- [ ] Callback success exchanges only the one-time `code` through `POST /auth/oauth/exchange`.
- [ ] Exchange requests include `x-api-key`, `x-application-id`, and `accept-language`.
- [ ] Exchange success persists the returned JWT through `saveSessionToken`, shows a localized success toast, and redirects to `/sign-in`.
- [ ] The implementation does not require `docs/specs/0008-session-management-with-cookies.md` or backend-managed HTTP-only cookies.
- [ ] Provider-status failures show a visible localized service-unavailable message in the sign-in page provider area.
- [ ] No JWT, provider access token, provider refresh token, Google client secret, or GitHub client secret is stored in frontend code or callback URLs.
- [ ] Callback error reasons show localized safe messages and return the user to `/sign-in`.
- [ ] `oauth_account_conflict` communicates that the user should sign in with email/password until explicit linking exists.
- [ ] Existing email/password sign-in, sign-up, password recovery, reset password, and protected route validation continue to work.
- [ ] UI copy exists in English and Portuguese.
- [ ] Provider buttons remain accessible and keyboard operable.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

## Test Plan

- Unit:
  - Test OAuth API functions construct the expected endpoints and payloads.
  - Test provider-status mapping enables only `google` and `github` entries with `enabled: true`.
  - Test callback query parsing for success, missing code, known error reason, and unknown error reason.
  - Test callback success calls `exchangeOAuthCode`, `saveSessionToken`, a success toast, and replace navigation to `/sign-in`.
  - Test callback exchange failure clears no new session and redirects to `/sign-in`.
  - Test reason-code-to-message mapping for all backend safe reasons.

- Integration:
  - Render `ProviderButtons` with provider-status success and assert only returned providers become enabled.
  - Render `ProviderButtons` with provider-status failure and assert buttons remain disabled with visible service-unavailable copy.
  - Click an enabled provider and assert `authorizeOAuthProvider` receives `window.location.origin + AppRoute.OAuthCallback`.
  - Render `OAuthCallbackPage` with a success code and mock exchange response; assert session save, success toast, and `/sign-in` navigation.
  - Render `OAuthCallbackPage` with `oauth_account_conflict`; assert localized error and `/sign-in` navigation.

- Manual verification:
  - Start the backend with OAuth env vars configured.
  - Start the frontend with `npm run dev`.
  - Confirm `GET /api/auth/oauth/providers` reports enabled providers without secrets.
  - Confirm Google and GitHub buttons are disabled when providers are not configured.
  - Configure Google only and confirm only Google is enabled.
  - Configure GitHub only and confirm only GitHub is enabled.
  - Click Google and confirm the browser navigates to Google authorization, returns to `/signin/callback`, exchanges the code, persists the token, shows a success toast, and lands on `/sign-in`.
  - Click GitHub and confirm the same flow.
  - Confirm protected requests after OAuth sign-in still send `Authorization: Bearer <token>` when the user later opens protected content.
  - Open `/signin/callback?provider=github&status=error&reason=oauth_account_conflict` and confirm the localized error state.
  - Use browser developer tools to confirm no provider token or JWT appears in callback query params.
  - Switch between English and Portuguese and confirm the `accept-language` header and visible copy align.
  - Run `npm run lint`.
  - Run `npm run build`.

## Risks and Mitigations

- Risk: The frontend callback path differs from the app's existing `/sign-in` route style.
  - Mitigation: use `/signin/callback` for the first rollout because the backend plan already allowlists `http://localhost:5173/signin/callback`; revisit naming only with a coordinated backend allowlist update.

- Risk: A copied callback URL can replay the exchange code.
  - Mitigation: rely on the backend's short-lived, one-time, hashed exchange codes and have the frontend exchange immediately, then navigate away with replace navigation.

- Risk: Users with existing password accounts hit `oauth_account_conflict`.
  - Mitigation: show clear localized copy and send them back to email/password sign-in until an explicit account-linking flow exists.

- Risk: Provider status may fail and make buttons appear broken.
  - Mitigation: keep buttons disabled and show visible localized service-unavailable copy in the provider area.

- Risk: Redirecting to `/sign-in` after a successful OAuth exchange can look like authentication failed because the token has already been persisted.
  - Mitigation: show a success toast on exchange success and treat any automatic redirect from `/sign-in` to `/home` as a separate explicit route-guard enhancement.

- Risk: Token handling spreads as OAuth is added.
  - Mitigation: keep exchange inside `src/features/auth/api.ts` and token persistence inside `src/lib/session.ts`.

- Risk: Backend provider slugs are free-form while the frontend initially knows only Google and GitHub.
  - Mitigation: ignore unknown provider-status entries until corresponding UI and copy are added.

- Risk: Frontend logs can accidentally expose callback codes.
  - Mitigation: do not log query params, exchange codes, authorization URLs, or exchange responses.

## Resolved Decisions

- Do not update ADR 0009. It was only needed for the quick-start disabled-provider state.
- Do not use `docs/specs/0008-session-management-with-cookies.md` as an input for this OAuth integration; keep bearer-token auth for now.
- Align the frontend callback route with the backend allowlist by using `/signin/callback`.
- Show a visible provider-login service-unavailable message on the sign-in page when the provider-status request fails.
- After successful OAuth exchange, show a success toast and redirect to the login route, currently `/sign-in`.

## Open Questions

- None.
