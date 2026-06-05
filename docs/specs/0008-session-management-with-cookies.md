# Spec 0008: Session Management With Cookies

## Objective

- Implement the session-management architecture accepted in `docs/adrs/0008-session-management-with-cookie-backed-auth.md`.
- Persist the current backend JWT response in a temporary frontend-managed cookie until backend-managed `HttpOnly` cookies are available.
- Keep all session reads, writes, validation, refresh, and clearing behind narrow helpers so the frontend can later move to backend-owned cookies with limited refactoring.
- Ensure authenticated routes, logout, invalid-token handling, and failed token validation clear or respect session state consistently.

## Background

- The SRS requires browser-cookie session persistence and requires the frontend to clear the session cookie on logout or invalid token detection.
- The backend currently returns JWT tokens in JSON responses for successful sign-in, sign-up, and OTP verification.
- The target production architecture is backend-managed `HttpOnly`, `Secure`, `SameSite` cookies.
- Backend-managed session cookies are not available yet, so ADR 0008 permits a temporary frontend-managed JWT cookie.
- `docs/specs/0007-integration-with-backend.md` already defines the auth API integration, tokenized auth responses, token validation endpoint, and one-hour temporary cookie lifetime.
- Current code already has a `src/lib/session.ts` helper and protected-route token validation, but logout clearing still needs to be implemented or verified as part of this spec.

## Scope

### In Scope

- Keep session persistence centralized in `src/lib/session.ts`.
- Store returned JWTs only through session helper functions.
- Read session tokens only through session helper functions.
- Clear session tokens only through session helper functions.
- Use a frontend-managed cookie with:
  - `SameSite=Lax`
  - `Secure` when `window.location.protocol === 'https:'`
  - `path=/`
  - bounded expiration aligned with the backend JWT lifetime, currently one hour.
- Protect authenticated routes by checking for a session token and validating it through the auth API before rendering protected content.
- Clear the temporary session cookie on:
  - explicit logout
  - invalid token detection
  - failed token validation
- Redirect anonymous or invalid-session users away from protected routes.
- Ensure refreshed tokens, if refresh is used, replace the old cookie through the helper.
- Add localized user-facing copy for logout controls and session-validation states when UI changes are needed.
- Document the future migration path from frontend-managed JWT cookies to backend-managed `HttpOnly` cookies.

### Out of Scope

- Backend changes in `auth-service`.
- Implementing backend-managed `HttpOnly` session cookies.
- OAuth provider session behavior.
- User profile, account settings, roles, permissions, or admin screens.
- Adding a new global state library for auth.
- Storing full user profiles in the session cookie.
- Adding an automated test runner if the project still has none when this spec is implemented.

## Proposed Approach

- Treat `src/lib/session.ts` as the only module that knows the temporary cookie name or cookie serialization details.
- Export a small session API:
  - `saveSessionToken(token: string): void`
  - `getSessionToken(): string | null`
  - `clearSessionToken(): void`
- Keep the cookie name private to `src/lib/session.ts`.
- Use `encodeURIComponent` and `decodeURIComponent` when writing and reading the token value.
- Set cookie attributes from one helper so save and clear behavior cannot drift.
- Use `max-age=3600` for the temporary cookie unless the backend JWT lifetime changes.
- Avoid `localStorage`, `sessionStorage`, direct `document.cookie`, or in-memory singleton storage for JWT persistence outside the session helper.
- Save tokens after successful sign-in, sign-up, and OTP verification through `saveSessionToken`.
- Validate protected routes by:
  - reading the token through `getSessionToken`
  - redirecting to `/sign-in` when no token exists
  - calling `validateToken(token)` before rendering protected content
  - clearing the token and redirecting when validation fails.
- Implement logout as a narrow UI action that:
  - calls `clearSessionToken`
  - navigates to `/sign-in`
  - does not call backend logout until a backend logout endpoint exists.
- If `refreshToken(token)` is wired into route validation or another session lifecycle step, persist `response.refreshedToken` through `saveSessionToken` and clear the old token on refresh failure.
- Keep public auth routes available to anonymous users. A later enhancement may redirect already-authenticated users away from sign-in/sign-up after validation, but that is not required for ADR 0008.
- When the backend later supports `HttpOnly` cookies, replace the internals of the session helper and auth API credentials behavior without changing page components.

Impacted files and directories:

- `src/lib/session.ts`
- `src/features/auth/api.ts`
- `src/features/auth/types.ts`
- `src/routes/ProtectedRoute.tsx`
- `src/routes/router.tsx`
- `src/routes/routes.enum.ts` if a logout route is introduced, though a button action is preferred.
- `src/pages/HomePage/HomePage.tsx` or another authenticated shell/page that exposes logout.
- `src/lib/i18n/locales/en.json`
- `src/lib/i18n/locales/pt.json`
- `src/App.css` if logout or session-state UI needs styles.

## Milestones

1. Audit existing token access
   - Search `src` for `document.cookie`, `localStorage`, `sessionStorage`, `Authorization`, `Bearer`, and token helper usage.
   - Confirm JWT persistence is only handled by `src/lib/session.ts`.
   - Remove or refactor any direct token reads and writes outside the helper.
2. Harden the session helper
   - Verify the helper writes `SameSite=Lax`, `path=/`, and one-hour `max-age`.
   - Verify `Secure` is added only in HTTPS environments.
   - Verify clearing uses the same cookie path and a zero or expired max age.
   - Keep the cookie name private to the helper.
3. Wire auth success paths
   - Ensure sign-in stores `response.token` through `saveSessionToken`.
   - Ensure sign-up stores `response.token` through `saveSessionToken`.
   - Ensure OTP verification stores `response.token` through `saveSessionToken` when OTP UI is implemented.
   - Redirect successful authenticated flows to `/home`.
4. Protect authenticated routes
   - Ensure `/home` is wrapped by `ProtectedRoute`.
   - Validate the stored token before rendering protected content.
   - Render a non-interactive loading state while validation is pending.
   - Clear the session token and redirect to `/sign-in` when validation fails.
5. Add logout behavior
   - Add a logout control to the authenticated page or authenticated app shell.
   - On logout, call `clearSessionToken`.
   - Navigate to `/sign-in` with replace navigation to avoid returning to protected content through browser history.
   - Add English and Portuguese copy for the logout action.
6. Prepare for backend-managed cookies
   - Keep component code independent of cookie details.
   - Add a short implementation note in the session helper or spec follow-up explaining which internals change once backend `HttpOnly` cookies exist.
   - Do not introduce frontend code that depends on decoding JWT payloads.
7. Verification pass
   - Run `npm run lint`.
   - Run `npm run build`.
   - Manually verify sign-in, protected-route refresh, invalid token clearing, and logout clearing.

## Edge Cases

- A cookie exists but has an empty value.
- A cookie value contains encoded characters.
- Multiple cookies exist and only one is the MeLogin session cookie.
- The app runs over HTTP during local development and must not set `Secure`.
- The app runs over HTTPS and must set `Secure`.
- A user opens `/home` without a cookie.
- A user opens `/home` with an expired or invalid token.
- Token validation fails after the user previously authenticated.
- A user logs out and then uses the back button.
- A user signs in again after logout.
- The backend JWT lifetime changes from one hour.
- The backend eventually sets `HttpOnly` cookies and no token is returned in JSON.
- Browser privacy settings block or clear cookies.

## Acceptance Criteria

- [ ] `src/lib/session.ts` is the only module that reads from or writes to `document.cookie` for auth session state.
- [ ] Application code outside `src/lib/session.ts` does not know the session cookie name.
- [ ] The temporary session cookie uses `SameSite=Lax`.
- [ ] The temporary session cookie uses `Secure` when the page is served over HTTPS.
- [ ] The temporary session cookie has `path=/`.
- [ ] The temporary session cookie uses a bounded one-hour expiration unless the backend token lifetime changes.
- [ ] Successful sign-in stores the returned token through `saveSessionToken` and redirects to `/home`.
- [ ] Successful sign-up stores the returned token through `saveSessionToken` and redirects to `/home`.
- [ ] Successful OTP verification stores the returned token through `saveSessionToken` when OTP login UI is implemented.
- [ ] `/home` does not render protected content until token validation succeeds.
- [ ] Opening `/home` without a session token redirects to `/sign-in`.
- [ ] Failed token validation clears the session through `clearSessionToken` and redirects to `/sign-in`.
- [ ] Logout clears the session through `clearSessionToken` and redirects to `/sign-in`.
- [ ] Refresh-token behavior, if wired, stores the refreshed token only through `saveSessionToken`.
- [ ] No component stores JWTs in `localStorage`, `sessionStorage`, source code, or component state for persistence.
- [ ] The implementation remains compatible with a future backend-managed `HttpOnly` cookie migration.

## Test Plan

- Unit:
  - Test `saveSessionToken` writes a cookie with the expected name, encoded value, path, `SameSite=Lax`, and bounded `max-age`.
  - Test `saveSessionToken` adds `Secure` when `window.location.protocol` is HTTPS.
  - Test `saveSessionToken` does not add `Secure` when `window.location.protocol` is HTTP.
  - Test `getSessionToken` returns `null` when the cookie is missing or empty.
  - Test `getSessionToken` decodes an encoded token value.
  - Test `clearSessionToken` expires the same cookie path.
- Integration:
  - When React Testing Library is configured, render `ProtectedRoute` with no token and assert it redirects to `/sign-in`.
  - Mock successful token validation and assert protected content renders.
  - Mock failed token validation and assert the session helper clears the token and protected content does not render.
  - Render the authenticated page, activate logout, and assert the session is cleared and navigation goes to `/sign-in`.
  - Mock refresh-token success, if refresh is wired, and assert the refreshed token replaces the stored token.
- Static checks:
  - Search for direct `document.cookie`, `localStorage`, and `sessionStorage` auth-token usage outside approved helpers.
  - Run `npm run lint`.
  - Run `npm run build`.
- Manual verification:
  - Start the backend and frontend locally.
  - Sign in with valid credentials and confirm `/home` renders after validation.
  - Refresh `/home` and confirm the session persists.
  - Manually corrupt or expire the session cookie and reload `/home`; confirm redirect to `/sign-in`.
  - Log out and confirm the session cookie is removed.
  - After logout, use the browser back button and confirm protected content is not shown.
  - Verify cookie attributes in browser developer tools over HTTP.
  - Verify `Secure` behavior in an HTTPS environment when available.

## Risks and Mitigations

- Risk: The temporary JWT cookie is readable by frontend JavaScript and is not `HttpOnly`.
  - Mitigation: Keep the cookie lifetime short, avoid decoding JWTs in the frontend, and keep all token handling in `src/lib/session.ts`.
- Risk: Session logic can spread into pages as auth features grow.
  - Mitigation: Use narrow helpers and route guards; do not let components touch cookie details.
- Risk: Clearing on validation failure can sign users out if the backend is temporarily unavailable.
  - Mitigation: Keep validation behavior explicit and revisit retry or service-unavailable handling if product requirements require offline tolerance.
- Risk: Cookie deletion can fail if path or attributes differ from the original write.
  - Mitigation: Build save and clear attributes through the same helper.
- Risk: Backend token lifetime can change without frontend updates.
  - Mitigation: Keep the lifetime constant easy to find and update; prefer backend-owned cookies when supported.
- Risk: Future backend-managed cookies may require `credentials: 'include'` and different auth API behavior.
  - Mitigation: Centralize request behavior in `src/lib/api.ts` and session behavior in `src/lib/session.ts`.

## Open Questions

- When will the backend support `HttpOnly` session cookies and a logout endpoint?
- Should validation failures caused by network or 5xx responses immediately clear the session, or should the app show a retry/service-unavailable state? Retry/Service unavailable.
- Should authenticated users who visit `/sign-in` or `/sign-up` be validated and redirected to `/home`? Yes.
- Should the one-hour cookie lifetime remain fixed, or should it be derived from backend configuration once available? Derived from backend once available.
