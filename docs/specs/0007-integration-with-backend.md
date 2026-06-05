# Spec 0006: Integration With Backend

## Objective
- Implement the initial frontend integration with the existing `auth-service` backend so auth forms can submit real requests, handle backend success/error contracts, and keep backend details isolated from page components.
- Configure the integration through Vite environment variables, starting with `VITE_AUTH_API_BASE_URL=http://localhost:3001/api` for local development.

## Background
- The app currently has route-level auth pages, React Hook Form + Zod validation, i18next language support, disabled provider buttons, and initial auth contract types in `src/features/auth/types.ts`.
- Form submit handlers are still placeholders and do not call the backend.
- ADR 0004 requires all auth backend calls to be isolated in `src/features/auth/api.ts`, with shared HTTP setup in `src/lib/api.ts` or an equivalent module.
- The SRS defines the backend at `/home/danii/myProjects/auth-service`, exposing auth routes under `/api`.
- Auth requests must include `Content-Type: application/json`, `x-api-key`, `x-application-id`, and `accept-language`. Authenticated requests must include `Authorization: Bearer <token>` when validation or refresh is needed.
- Backend 4xx responses return `{ error }`; success message endpoints return `{ message }`; successful sign-in and sign-up return `{ token, user }`.

## Scope
### In Scope
- Add environment configuration for:
  - `VITE_AUTH_API_BASE_URL`
  - `VITE_AUTH_API_KEY`
  - `VITE_AUTH_APPLICATION_ID`
- Create shared HTTP/config helpers under `src/lib`, including typed config reads and a JSON request helper.
- Create `src/features/auth/api.ts` with typed functions for:
  - `signIn`
  - `signUp`
  - `requestPasswordRecovery`
  - `resetPassword`
  - `requestOtpLogin`
  - `verifyOtpLogin`
  - `validateToken`
  - `refreshToken`
- Wire existing auth pages to call the auth API through hooks or narrow handlers, without direct `fetch` calls in components.
- Show backend 4xx `error` values with Sonner toasts.
- Show localized fallback toasts for network failures, missing `error`, and 5xx responses.
- Show backend `message` values for password recovery and reset success.
- Store returned JWTs through a narrow session helper in `src/lib/session.ts` until backend-managed `HttpOnly` cookies exist.
- Redirect successful sign-in and sign-up to `/home` after storing the returned token.
- Keep Google and GitHub provider buttons disabled until backend-owned OAuth routes are documented.

### Out of Scope
- Backend code changes in `auth-service`.
- Google or GitHub OAuth implementation.
- User profile, account settings, roles, permissions, or admin screens.
- Full production session hardening with backend-managed `HttpOnly` cookies.
- Adding a test runner unless a later implementation task explicitly includes it.

## Proposed Approach
- Add `.env.example` and `.env` with the local backend base URL. Keep actual API key and application ID values out of source unless they are non-secret local placeholders.
- Add `src/lib/config.ts` to read and normalize Vite env values. Fail fast in development when required auth config is missing, while returning user-safe errors through the auth API layer.
- Add `src/lib/api.ts` with a typed `requestJson` helper that:
  - Builds URLs from `VITE_AUTH_API_BASE_URL` plus endpoint paths.
  - Adds required auth headers centrally.
  - Reads the active backend language through the existing language helper.
  - Parses JSON responses only when present.
  - Converts 4xx `{ error }` responses into a typed auth error.
  - Converts 5xx, malformed JSON, and network failures into typed generic errors.
- Add `src/lib/session.ts` with `saveSessionToken`, `getSessionToken`, and `clearSessionToken`. The helper shall write a temporary frontend-managed cookie using `SameSite=Lax`, `Secure` when running over HTTPS, and a bounded expiration.
- Add `src/features/auth/api.ts` to expose endpoint-specific functions. These functions shall map frontend form names to backend payload names, especially reset password `newPassword` to `new_password`.
- Update page submit handlers, or add `src/features/auth/hooks` hooks, so UI code depends on typed auth functions rather than raw networking.
- Add a single Sonner toast host at the app root if it is not already mounted before this integration begins.
- Use React Router navigation after successful auth mutations.
- Preserve disabled provider button behavior from ADR 0009.

## Milestones
1. Environment and config
   - Create `.env.example` and `.env`.
   - Add typed config reads in `src/lib/config.ts`.
   - Document required values and local defaults.
2. Shared HTTP and error model
   - Add `src/lib/api.ts`.
   - Define typed application errors for backend 4xx, service failures, and network failures.
   - Ensure every auth request includes required headers.
3. Auth API module
   - Add `src/features/auth/api.ts`.
   - Implement typed functions for all endpoints listed in the SRS.
   - Keep request/response types in `src/features/auth/types.ts` aligned with backend contracts.
4. Session helper
   - Add `src/lib/session.ts`.
   - Store sign-in and OTP verification tokens through the helper only.
   - Clear invalid or failed validation sessions through the helper only.
5. UI wiring
   - Connect sign-in, sign-up, password recovery, and reset password forms to the auth API.
   - Add submit pending states and prevent duplicate submissions.
   - Show Sonner toasts for backend errors, fallback errors, and success messages.
   - Redirect according to the SRS.
6. Verification pass
   - Run `npm run lint`.
   - Run `npm run build`.
   - Manually verify success, 4xx, 5xx/network, language header, and reset-token flows against the local backend or mocked responses.

## Edge Cases
- Backend returns a 4xx response without an `error` field.
- Backend returns non-JSON or empty responses.
- Backend is unavailable or blocked by CORS.
- Required env values are missing.
- Sign-up returns a tokenized auth response with a redacted user payload.
- Reset password route is opened without `?token=`.
- Selected language changes between opening the page and submitting a request.
- Token validation fails after a token was previously stored.
- Running over HTTP should not set the cookie `Secure` attribute; running over HTTPS should.

## Acceptance Criteria
- [ ] `.env.example` and `.env` exist and include `VITE_AUTH_API_BASE_URL=http://localhost:3001/api`.
- [ ] Auth API key and application ID are read through Vite env variables, not hardcoded in components.
- [ ] Page components do not call `fetch` directly for auth flows.
- [ ] `src/features/auth/api.ts` exports typed functions for the SRS auth endpoints.
- [ ] Every auth request includes `Content-Type: application/json`, `x-api-key`, `x-application-id`, and `accept-language`.
- [ ] Authenticated validation/refresh requests include `Authorization: Bearer <token>`.
- [ ] Sign-in with a valid backend response stores the returned token through `src/lib/session.ts` and redirects to `/home`.
- [ ] Sign-up sends `{ name, email, password }` without `confirmPassword`.
- [ ] Password recovery displays the backend `message` value on success.
- [ ] Reset password sends `{ token, new_password }` and displays the backend `message` value on success.
- [ ] Backend 4xx responses show a Sonner toast using the backend `error` value.
- [ ] 5xx responses and network failures show localized fallback toasts.
- [ ] Google and GitHub buttons remain disabled and do not make network requests.

## Test Plan
- Unit:
  - Cover config parsing for present/missing env values.
  - Cover URL construction and required header construction in the shared API helper.
  - Cover session helper cookie write/read/clear behavior.
  - Cover auth API payload mapping, especially reset password `new_password`.
- Integration:
  - When a test runner is configured, mock backend responses for sign-in, sign-up, password recovery, reset password, token validation, 4xx errors, 5xx errors, and network failures.
  - Verify page-level submit handlers call auth API functions and display the correct toast or redirect behavior.
- Manual verification:
  - Start the backend on `http://localhost:3001/api`.
  - Run the frontend with `npm run dev`.
  - Submit sign-in with valid and invalid credentials.
  - Submit sign-up with a new account and duplicate email.
  - Submit password recovery and verify the success message.
  - Open `/reset-password?token=test-token` and submit a valid new password.
  - Switch between English and Portuguese and confirm the `accept-language` header changes.
  - Stop the backend and confirm network failures use localized fallback copy.
  - Run `npm run lint` and `npm run build`.

## Risks and Mitigations
- Risk: The frontend-managed JWT cookie is not `HttpOnly`.
  - Mitigation: Keep all token access inside `src/lib/session.ts` and treat this as temporary until backend-managed cookies are available.
- Risk: API key values in a browser app can be inspected.
  - Mitigation: Treat `VITE_AUTH_API_KEY` as application identification only, not as a secret or authorization boundary.
- Risk: Backend response contracts may drift from the SRS.
  - Mitigation: Keep endpoint functions centralized in `src/features/auth/api.ts` and update shared types when backend contracts change.
- Risk: CORS may block local frontend requests.
  - Mitigation: Verify backend CORS allows the Vite dev origin and document any backend-side change separately.
- Risk: Duplicate spec numbering exists because another spec also uses `0006`.
  - Mitigation: Keep this file at the user-requested path and use the title to disambiguate the backend integration work.

## Open Questions
- What are the approved local development values for `VITE_AUTH_API_KEY` and `VITE_AUTH_APPLICATION_ID`?
- What is the backend JWT expiration period that the temporary frontend cookie should mirror? 1 hour.
- Should token validation run on app startup before rendering protected routes, or only when entering authenticated pages? Should run on app startup before rendering protected routes.
