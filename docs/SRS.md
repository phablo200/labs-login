# Software Requirements Specification: Login Frontend

## 1. Purpose

This document specifies the frontend requirements for a web authentication application. The application shall allow users to sign in, sign up, recover/reset passwords, and authenticate through external providers, starting with Google and GitHub. The frontend shall consume the existing `auth-service` backend and shall present validation errors, backend errors, and success states clearly to the user.

## 2. Scope

### 2.1 In Scope

- Sign in with email and password.
- Sign up with name, email, password, and password confirmation.
- Password recovery request by email.
- Password reset from a tokenized recovery link.
- Provider login options for Google and GitHub.
- Session persistence through browser cookies.
- Toast display for backend 4xx errors.
- Portuguese and English UI support.
- Responsive, accessible authentication screens.

### 2.2 Out of Scope

- Backend implementation or changes.
- User profile management after authentication.
- Administration screens.
- Role and permission management.

## 3. System Context

The application is a Vite React frontend. It shall integrate with the backend located at `/home/danii/myProjects/auth-service`. The backend exposes authentication routes under `/api` and currently returns JWT tokens for successful sign-in and OTP verification.

The frontend shall redirect authenticated users to `/home` after successful login or registration.

## 4. Backend Integration Requirements

### 4.1 Base Configuration

The frontend shall support configurable environment values:

- `VITE_AUTH_API_BASE_URL`, for example `http://localhost:3001/api`.
- `VITE_AUTH_API_KEY`, sent as `x-api-key`.
- `VITE_AUTH_APPLICATION_ID`, sent as `x-application-id`.

Every unauthenticated auth request shall include:

- `Content-Type: application/json`
- `x-api-key`
- `x-application-id`
- `accept-language`, using `pt` or `en` according to the selected UI language.

Authenticated requests shall include `Authorization: Bearer <token>` when token validation or refresh is required.

### 4.2 Endpoints

The frontend shall consume these backend endpoints:

| Feature | Method | Endpoint | Request Body | Success Response |
| --- | --- | --- | --- | --- |
| Sign in | `POST` | `/auth/signin` | `{ email, password }` | `{ token, user }` |
| Sign up | `POST` | `/auth/signup` | `{ name, email, password }` | `{ token, user }` |
| Forgot password | `POST` | `/auth/forgot-password` | `{ email }` | `{ message }` |
| Reset password | `PATCH` | `/auth/reset-password` | `{ token, new_password }` | `{ message }` |
| Request OTP login | `POST` | `/auth/request-otp-login` | `{ email }` | `{ message }` |
| Verify OTP login | `POST` | `/auth/verify-otp-login` | `{ email, code }` | `{ token, user }` |
| Validate token | `GET` | `/auth/validate-token` | none | `{ valid: true }` |
| Refresh token | `GET` | `/auth/refresh-token` | none | `{ refreshedToken }` |

Provider login buttons for Google and GitHub shall be displayed. The current backend does not expose Google or GitHub OAuth endpoints, so these actions shall be implemented as frontend integration points and remain blocked until the backend contract is available. Once provided, the frontend shall initiate provider login through backend-owned OAuth routes instead of handling provider secrets directly.

## 5. Functional Requirements

### 5.1 Sign In

- The system shall show fields for email and password.
- The system shall validate required fields before submitting.
- The system shall validate email format before submitting.
- On successful sign-in, the system shall store the returned token in a cookie-backed session and redirect to `/home`.
- On a 4xx response, the system shall show a toast using the backend `error` value.

### 5.2 Sign Up

- The system shall show fields for name, email, password, and confirm password.
- The system shall validate required fields, email format, minimum password length, and password confirmation match.
- The confirm password field shall not be sent to the backend.
- On successful sign-up, the system shall store the returned token in a cookie-backed session and redirect to `/home`.
- On a 4xx response, the system shall show a toast using the backend `error` value, including duplicate email errors.

### 5.3 Password Recovery

- The system shall allow a user to request password recovery by email.
- The system shall call `/auth/forgot-password` and show the backend `message` on success.
- The system shall not reveal whether the email exists.
- The system shall support `/reset-password?token=<token>` links.
- The reset form shall validate required password fields, minimum length, and confirmation match before calling `/auth/reset-password`.

### 5.4 Provider Login

- The system shall show options labeled “Continue with Google” and “Continue with GitHub” in English and equivalent Portuguese text.
- Provider buttons shall not collect passwords.
- If backend OAuth routes are unavailable, the buttons shall use a disabled or non-destructive state that communicates the feature is unavailable without causing failed authentication.

### 5.5 Error Handling and Toasts

- For any 4xx backend response, the system shall read `response.error` and show it in a toast.
- If `response.error` is absent, the system shall show a localized generic authentication error.
- 5xx responses shall show a localized generic service-unavailable or unexpected-error toast.
- Field-level frontend validation errors shall be shown near the relevant input before submission.

### 5.6 Internationalization

- The system shall support Portuguese and English UI copy.
- The selected language shall control local labels, validation messages, and the backend `accept-language` header.
- Default language shall be English unless browser or stored preference indicates Portuguese.

## 6. Session and Security Requirements

- The frontend shall persist authenticated state using cookies.
- Cookies shall use secure attributes where available: `SameSite=Lax` or stricter, `Secure` in HTTPS environments, and a bounded expiration aligned with backend token lifetime.
- The frontend shall not store secrets, API keys, or tokens in source code.
- OAuth provider secrets shall never be present in frontend code.
- Password fields shall use masked inputs and browser autocomplete attributes appropriate to the flow.
- The frontend shall clear the session cookie on logout or invalid token detection.

## 7. Non-Functional Requirements

- The UI shall be responsive across mobile, tablet, and desktop widths.
- Forms shall be keyboard navigable.
- Inputs shall have accessible labels and visible focus states.
- Toasts shall be announced to assistive technologies when possible.
- The initial auth screen should load quickly on normal broadband connections and avoid unnecessary blocking assets.
- The application shall support current versions of Chrome, Edge, Firefox, and Safari.

## 8. Acceptance Criteria

- A user can sign in with valid email/password credentials and is redirected to `/home`.
- A user cannot submit sign-in, sign-up, or recovery forms with missing required fields.
- A user cannot submit invalid email formats.
- A user cannot submit sign-up or reset forms when password confirmation does not match.
- Backend 4xx responses display a toast using the backend `error` field.
- Successful password recovery displays the backend `message` field.
- UI text can be displayed in English and Portuguese.
- Auth requests include `x-api-key`, `x-application-id`, and `accept-language`.
- Provider login buttons for Google and GitHub are present, with implementation dependent on backend OAuth routes.

## 9. Test Requirements

- Unit tests shall cover validation rules for each form.
- Component tests shall cover submit disabled/error states and backend error toast behavior.
- Integration tests shall mock backend responses for success, 4xx errors, and 5xx errors.
- Manual verification shall cover sign-in, sign-up, forgot password, reset password, language switching, responsive layout, and keyboard navigation.

## 10. Risks and Open Questions

- The backend currently returns JWT tokens, while the desired frontend storage is cookie-based. Final implementation must decide whether the frontend sets a client-readable cookie or the backend adds HTTP-only session cookie support.
- Google and GitHub OAuth routes are not currently present in the backend; provider login cannot be fully implemented until those routes are defined.
- The backend sign-up endpoint must return `{ token, user }` and must not expose password hashes in the user payload.
- Backend password validation for auth routes currently checks presence only. The frontend shall enforce stronger client-side validation, but backend parity is recommended.
