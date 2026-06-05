# Plan: Integration With Backend

## Source Documents

- Spec: `docs/specs/0007-integration-with-backend.md`
- SRS: `docs/SRS.md`
- ADR: `docs/adrs/0004-isolate-auth-backend-integration.md`
- ADR: `docs/adrs/0006-use-i18next-for-internationalization.md`
- ADR: `docs/adrs/0007-use-sonner-for-toast-notifications.md`
- ADR: `docs/adrs/0008-session-management-with-cookie-backed-auth.md`
- ADR: `docs/adrs/0009-disable-provider-login-until-backend-contract-exists.md`
- Project instructions: `.codex/instructions.md`

## Decisions Confirmed

- Keep backend calls isolated in `src/features/auth/api.ts`.
- Keep shared request/config/session helpers under `src/lib`.
- Read backend settings from Vite env variables:
  - `VITE_AUTH_API_BASE_URL`
  - `VITE_AUTH_API_KEY`
  - `VITE_AUTH_APPLICATION_ID`
- Use `http://localhost:3001/api` as the local backend base URL.
- Send `Content-Type: application/json`, `x-api-key`, `x-application-id`, and `accept-language` on auth requests.
- Send `Authorization: Bearer <token>` for authenticated validation and refresh requests.
- Show backend 4xx `{ error }` values with Sonner.
- Show backend `{ message }` values for password recovery and reset password success.
- Store returned JWTs through `src/lib/session.ts` as a temporary frontend-managed cookie.
- Use a one-hour cookie lifetime to match the reviewed spec answer.
- Validate tokens on app startup before rendering protected routes.
- Redirect successful sign-in and sign-up to `/home` after saving the returned token.
- Keep Google and GitHub provider buttons disabled.

## Current State

Auth pages already exist and use React Hook Form, Zod, i18next copy, and shared auth UI components:

```text
src/pages/
├── PasswordRecoveryPage/
├── ResetPasswordPage/
├── SignInPage/
└── SignUpPage/
```

The current submit handlers are placeholders:

```text
handleValidSignIn()
handleValidSignUp()
handleValidPasswordRecovery()
handleValidResetPassword()
```

Existing relevant modules:

```text
src/features/auth/
├── components/
├── types.ts
└── validation.ts

src/lib/
├── i18n.ts
├── i18n.types.ts
├── language.ts
└── i18n/
```

`sonner` is not currently listed in `package.json`, so the backend integration implementation must add it before using toast notifications.

## Implementation Steps

### 1. Confirm Environment Files

- Keep `.env.example` with:

```bash
VITE_AUTH_API_BASE_URL=http://localhost:3001/api
VITE_AUTH_API_KEY=replace-with-local-api-key
VITE_AUTH_APPLICATION_ID=replace-with-application-id
```

- Keep `.env` with:

```bash
VITE_AUTH_API_BASE_URL=http://localhost:3001/api
VITE_AUTH_API_KEY=
VITE_AUTH_APPLICATION_ID=
```

- Do not hardcode actual API keys or application IDs in source files.
- If local non-secret values are provided later, update only `.env`.

### 2. Add Sonner

- Install Sonner:

```bash
npm install sonner
```

- Mount one `Toaster` host near the app root, likely in `src/App.tsx`.
- Keep toast styling minimal and compatible with the existing light/dark theme.

### 3. Add Config Helper

- Create `src/lib/config.ts`.
- Export a typed auth config helper that reads:
  - `import.meta.env.VITE_AUTH_API_BASE_URL`
  - `import.meta.env.VITE_AUTH_API_KEY`
  - `import.meta.env.VITE_AUTH_APPLICATION_ID`
- Normalize the base URL by trimming trailing slashes.
- Treat missing values as configuration errors.
- Keep error details useful in development but avoid exposing raw internals in user-facing toasts.

### 4. Add Shared API Helper

- Create `src/lib/api.ts`.
- Implement a typed JSON request helper that accepts:
  - endpoint path
  - HTTP method
  - optional body
  - optional bearer token
- Build URLs from `VITE_AUTH_API_BASE_URL` plus endpoint paths.
- Add these headers centrally:
  - `Content-Type: application/json`
  - `x-api-key`
  - `x-application-id`
  - `accept-language`
- Use `getBackendLanguage()` from `src/lib/language.ts` for the language header.
- Parse JSON only when a response body exists.
- Convert backend and network failures into typed errors:
  - 4xx with `{ error }`: backend auth error with message.
  - 4xx without `{ error }`: generic localized auth error.
  - 5xx: generic localized service error.
  - network failure: generic localized network/service error.
  - malformed JSON: generic localized unexpected error.

### 5. Add Session Helper

- Create `src/lib/session.ts`.
- Export:
  - `saveSessionToken(token: string): void`
  - `getSessionToken(): string | null`
  - `clearSessionToken(): void`
- Store the token in a temporary frontend-managed cookie.
- Use:
  - `SameSite=Lax`
  - `Secure` only when `window.location.protocol === 'https:'`
  - `max-age=3600`
  - `path=/`
- Keep cookie name local to this helper.
- Do not read or write the token directly in components.

### 6. Implement Auth API Module

- Create `src/features/auth/api.ts`.
- Export typed functions:
  - `signIn(request: SignInRequest): Promise<SignInResponse>`
  - `signUp(request: SignUpRequest): Promise<SignInResponse>`
  - `requestPasswordRecovery(request: ForgotPasswordRequest): Promise<MessageResponse>`
  - `resetPassword(request: ResetPasswordRequest): Promise<MessageResponse>`
  - `requestOtpLogin(request: RequestOtpLoginRequest): Promise<MessageResponse>`
  - `verifyOtpLogin(request: VerifyOtpLoginRequest): Promise<SignInResponse>`
  - `validateToken(token: string): Promise<{ valid: true }>`
  - `refreshToken(token: string): Promise<{ refreshedToken: string }>`
- Map endpoints exactly:
  - `POST /auth/signin`
  - `POST /auth/signup`
  - `POST /auth/forgot-password`
  - `PATCH /auth/reset-password`
  - `POST /auth/request-otp-login`
  - `POST /auth/verify-otp-login`
  - `GET /auth/validate-token`
  - `GET /auth/refresh-token`
- Ensure reset password sends `new_password`.
- Keep all `fetch` usage inside `src/lib/api.ts` or `src/features/auth/api.ts`.

### 7. Add Auth Flow Helpers

- Prefer small hooks under `src/features/auth/hooks` if submit logic becomes repetitive.
- At minimum, centralize error-to-toast behavior so pages do not duplicate backend error branching.
- Add localized fallback copy keys for:
  - generic auth failure
  - service unavailable
  - network failure
  - sign-up success if needed
  - reset success if backend omits `message`
  - recovery success if backend omits `message`
- Update both `src/lib/i18n/locales/en.json` and `src/lib/i18n/locales/pt.json`.

### 8. Wire Sign-In

- Update `src/pages/SignInPage/SignInPage.tsx`.
- Replace `handleValidSignIn` with an async submit handler.
- Call `signIn({ email, password })`.
- On success:
  - save `response.token` with `saveSessionToken`
  - navigate to `AppRoute.Home`
- On failure:
  - show backend `error` or localized fallback toast
- Use `formState.isSubmitting` to disable the submit button and prevent duplicate submissions.

### 9. Wire Sign-Up

- Update `src/pages/SignUpPage/SignUpPage.tsx`.
- Replace `handleValidSignUp` with an async submit handler.
- Send only:
  - `name`
  - `email`
  - `password`
- Do not send `confirmPassword`.
- On success:
  - save `response.token` with `saveSessionToken`
  - navigate to `AppRoute.Home`
- On failure:
  - show backend `error` or localized fallback toast
- Use `formState.isSubmitting` for pending state.

### 10. Wire Password Recovery

- Update `src/pages/PasswordRecoveryPage/PasswordRecoveryPage.tsx`.
- Replace `handleValidPasswordRecovery` with an async submit handler.
- Call `requestPasswordRecovery({ email })`.
- On success:
  - show backend `message`
  - keep the user on the recovery page unless a product decision says to redirect
- On failure:
  - show backend `error` or localized fallback toast
- Use `formState.isSubmitting` for pending state.

### 11. Wire Reset Password

- Update `src/pages/ResetPasswordPage/ResetPasswordPage.tsx`.
- Replace `handleValidResetPassword` with an async submit handler.
- Call `resetPassword({ token, new_password })`.
- The page form values use `newPassword`; map that value before calling the API.
- On success:
  - show backend `message`
  - navigate to `AppRoute.SignIn`
- On failure:
  - show backend `error` or localized fallback toast
- Preserve the missing-token state without making a backend call.
- Use `formState.isSubmitting` for pending state.

### 12. Add Startup Session Validation

- Add a route guard or app-level bootstrap under `src/routes` or `src/features/auth/hooks`.
- On app startup:
  - read the token through `getSessionToken`
  - if no token exists, render public routes normally
  - if a token exists, call `validateToken(token)` before rendering protected routes
  - clear the token on invalid validation, 401/403, or failed validation
- Protect `AppRoute.Home` from unauthenticated access.
- Redirect unauthenticated `/home` visits to `AppRoute.SignIn`.
- Avoid blocking public auth pages on validation longer than necessary.

### 13. Preserve Provider Button Behavior

- Leave Google and GitHub buttons disabled.
- Ensure provider buttons do not submit forms.
- Do not add OAuth redirects, provider SDKs, client secrets, or token exchange code.

### 14. Update Types

- Keep `src/features/auth/types.ts` aligned with the reviewed spec.
- Ensure sign-up success type matches `{ token, user }`.
- Add explicit response types for token validation and refresh if missing:
  - `ValidateTokenResponse`
  - `RefreshTokenResponse`
- Do not import backend source files.

### 15. Manual Browser Checks

- Run the backend locally at `http://localhost:3001/api`.
- Run the frontend with:

```bash
npm run dev
```

- Verify:
  - valid sign-in stores a cookie and redirects to `/home`
  - invalid sign-in shows backend `error`
  - valid sign-up stores a cookie and redirects to `/home`
  - duplicate sign-up email shows backend `error`
  - password recovery shows backend `message`
  - reset password with `?token=test-token` sends `new_password`
  - `/reset-password` without a token does not call the backend
  - English and Portuguese selections change the `accept-language` request header
  - stopping the backend produces localized fallback copy
  - Google and GitHub buttons remain disabled and make no request

## Verification

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

When available, add and run tests for:

- config parsing
- request URL/header construction
- session cookie read/write/clear
- auth API payload mapping
- page submit success and failure behavior with mocked auth API responses

## Completion Criteria

- `.env.example` and `.env` include the backend base URL.
- `sonner` is installed and one `Toaster` host is mounted.
- `src/lib/config.ts` exists and reads Vite env values.
- `src/lib/api.ts` exists and centralizes request headers, JSON parsing, and error conversion.
- `src/lib/session.ts` exists and is the only token read/write path.
- `src/features/auth/api.ts` exists and exports typed functions for all SRS auth endpoints.
- Sign-in, sign-up, password recovery, and reset password forms call the backend through the auth API module.
- No page component calls `fetch` directly.
- Backend 4xx `error` values and success `message` values are surfaced through Sonner.
- 5xx and network failures use localized fallback copy.
- Successful sign-in and sign-up save the returned token and redirect to `/home`.
- `/home` is protected by startup token validation.
- Provider buttons remain disabled.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.

## Deferred Work

- Backend-managed `HttpOnly` session cookies.
- Google and GitHub OAuth routes.
- Full OTP login UI.
- Automated test runner setup if it remains absent during this implementation.
- End-to-end tests against a running backend.
- Production deployment configuration for real API base URLs and application identifiers.

## Risks and Mitigations

- Risk: The temporary JWT cookie is readable by frontend JavaScript.
  - Mitigation: Keep all token handling in `src/lib/session.ts` and replace it with backend-managed cookies when available.
- Risk: Local env values may be missing during development.
  - Mitigation: Fail clearly in development and show user-safe fallback copy in auth flows.
- Risk: Backend CORS may block the Vite dev origin.
  - Mitigation: Verify against the running backend early and document any required backend CORS update separately.
- Risk: Backend response shapes may differ from the reviewed spec.
  - Mitigation: Keep all response assumptions inside `src/features/auth/api.ts` and update types with the backend contract.
- Risk: Startup validation could delay public auth pages.
  - Mitigation: Scope blocking validation to protected routes and avoid unnecessary validation before rendering public routes.
