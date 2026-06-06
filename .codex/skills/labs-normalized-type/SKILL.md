---
name: labs-normalized-type
description: >-
  Enforce role-based naming for TypeScript type declarations in labs-login:
  backend inputs end in Request, backend outputs end in Response, backend error
  bodies end in ErrorResponse, React Hook Form values end in FormValues,
  component props end in Props, config shapes end in Config, state shapes end in
  State, and plain domain models carry no role suffix. Use when creating,
  editing, reviewing, or normalizing interface/type/enum declarations under src.
---

# Labs Normalized Type Names

## Purpose
Keep TypeScript type names in labs-login consistent by naming each declaration after the role it plays in the frontend architecture.

This skill governs type names only. Use it with the repository architecture rules in `.codex/instructions.md`, especially the feature-based layout and auth backend isolation rules.

## Scope
Applies to every `interface`, `type`, and `enum` declared in TypeScript app code under `src/**/*.ts` and `src/**/*.tsx`.

Out of scope:
- JavaScript files.
- Third-party types imported from libraries.
- Runtime function, variable, component, and CSS class names.
- Generated files or external API docs.

## Convention

| Type role | Typical location | Required naming | Examples |
| --- | --- | --- | --- |
| Backend request body/query contract | `src/features/<feature>/types.ts`, `src/features/auth/types.ts` | `*Request` | `SignInRequest`, `ResetPasswordRequest`, `VerifyOtpLoginRequest` |
| Backend success response contract | `src/features/<feature>/types.ts`, API modules | `*Response` | `SignInResponse`, `MessageResponse`, `RefreshTokenResponse` |
| Backend error response contract | `src/features/<feature>/types.ts`, API modules | `*ErrorResponse` | `AuthErrorResponse`, `ApiErrorResponse` |
| React Hook Form values | `src/features/<feature>/validation.ts`, route pages | `*FormValues` | `SignInFormValues`, `ResetPasswordFormValues` |
| Component props contract | `ComponentName.types.ts` or local component file | `ComponentNameProps` | `AuthLayoutProps`, `PasswordFieldProps` |
| Configuration shape | `src/lib/config.ts`, shared lib modules | `*Config` | `AuthApiConfig`, `RuntimeConfig` |
| Session shape | `src/lib/session.ts` or auth hooks | `*Session` | `AuthSession`, `StoredSession` |
| Hook or reducer state shape | `src/features/<feature>/hooks`, `src/hooks` | `*State` | `AuthSessionState`, `TokenValidationState` |
| Domain/model shape assembled by the app | feature `types.ts`, shared model modules | no role suffix | `AuthUser`, `SupportedLanguage` |
| Route or message-key enum | `src/routes`, i18n/helpers | name after concept, no generic suffix | `AppRoute`, `SupportedLanguage` |

## Role Rules

### Backend contracts use `Request` and `Response`

Types that describe what the frontend sends to the backend must end in `Request`.

Types that describe successful backend response bodies must end in `Response`.

```ts
export type SignInRequest = {
  email: string
  password: string
}

export type SignInResponse = {
  token: string
  user: AuthUser
}
```

Do not use `Payload`, `Result`, `Data`, or `Dto` for backend wire contracts. Normalize them to the role they actually play:

- `SignInPayload` -> `SignInRequest`
- `LoginResult` -> `SignInResponse`
- `AuthDto` -> split into specific `*Request` and `*Response` contracts

### Backend error bodies use `ErrorResponse`

Backend 4xx responses use `{ error }`, so the body type must make that role explicit.

```ts
export type AuthErrorResponse = {
  error: string
}
```

Use `ErrorResponse`, not plain `Error`, for server response bodies. Plain `Error` should be reserved for JavaScript errors or app-level error classes.

### Form state uses `FormValues`

React Hook Form values are UI state, not backend requests. Name them `*FormValues` even when they look similar to a backend request.

```ts
export type SignUpFormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}
```

Map form values to backend requests explicitly at the submit boundary:

```ts
const request: SignUpRequest = {
  name: values.name,
  email: values.email,
  password: values.password,
}
```

Do not name form values `*Request`, because fields such as `confirmPassword` may be frontend-only and must not be sent to the backend.

### Component props use `ComponentNameProps`

Props contracts must be named after the component they belong to.

```ts
export type PasswordFieldProps = {
  id: string
  label: string
}
```

Avoid generic names such as `Props`, `FieldProps`, or `InputOptions` when the type is exported. Local unexported helper types may be shorter only when there is no ambiguity.

### Config, session, and state types use role suffixes

Shared runtime configuration shapes end in `Config`.

Session shapes end in `Session`.

Hook, reducer, or loading/error snapshots end in `State`.

```ts
export type AuthApiConfig = {
  baseUrl: string
  apiKey: string
  applicationId: string
}

export type AuthSessionState = {
  status: 'loading' | 'authenticated' | 'anonymous'
}
```

### Domain models carry no role suffix

Plain domain models should read like the thing they represent and should not carry role words.

```ts
export type AuthUser = {
  id: string
  email: string
  name: string
}
```

Avoid `AuthUserResponse` unless it is specifically the backend response body. If the same shape is used as an app model after parsing, use `AuthUser`.

### Enums are named after their concept

Enums should not receive generic suffixes such as `Enum` or `Type`.

```ts
export enum AppRoute {
  SignIn = '/sign-in',
  Home = '/home',
}
```

Use a suffix only when it is part of the domain language and removes ambiguity.

## Violations to Fix

| Violation | Fix |
| --- | --- |
| Backend input named `*Payload`, `*Data`, or `*Dto` | Rename to `*Request` |
| Backend success output named `*Payload`, `*Result`, or `*Data` | Rename to `*Response` |
| Backend `{ error }` body named `*Error` | Rename to `*ErrorResponse` |
| React Hook Form values named `*Request` | Rename to `*FormValues` and map to a request at submit time |
| Exported component props named plain `Props` | Rename to `ComponentNameProps` |
| Domain model named `*Response`, `*Result`, `*Model`, or `*Type` | Rename after the domain concept |
| Enum named `*Enum` | Drop `Enum` and name the concept directly |
| Same concept named inconsistently across files | Pick the role-correct name and update imports/usages |

## How to Apply

### Proactive on TypeScript edits

When adding or editing a type declaration:

1. Classify the declaration by role: backend request, backend response, backend error response, form values, component props, config, session, state, domain model, or enum.
2. Check the name against the convention table.
3. If the name is wrong, rename the declaration in the same edit.
4. Search for the old name repo-wide and update every import and usage.
5. Keep backend request/response contracts in feature modules such as `src/features/auth/types.ts`.
6. Keep component props in `ComponentName.types.ts` when the component has a public props contract.
7. Do not introduce broad type aliases such as `AnyObject`, `ApiPayload`, or `ResponseData` unless there is a concrete local need and a role-correct name.

### Manual normalization

When the user invokes `labs-normalized-type` to normalize existing code:

1. Identify the target files:

```bash
git diff --name-only -- 'src/**/*.ts' 'src/**/*.tsx'
```

If the user names a folder or file, audit that scope instead.

2. List each declared `interface`, `type`, and `enum`.
3. Classify each declaration by role.
4. Rename violators and update all imports/usages.
5. Report each rename in this format:

```text
renamed: <old> -> <new> (<file>, role=<request|response|error-response|form-values|props|config|session|state|model|enum>)
```

6. Run:

```bash
npm run typecheck
npm run lint
```

7. If implementation behavior changed or types touched build-critical code, also run:

```bash
npm run build
```

## Current Project Examples

- `src/features/auth/types.ts`
  - `AuthUser` is a domain model and has no role suffix.
  - `SignInRequest`, `SignUpRequest`, `ResetPasswordRequest`, and OTP request types are backend input contracts.
  - `SignInResponse`, `SignUpResponse`, and `MessageResponse` are backend output contracts.
  - `AuthErrorResponse` is the backend 4xx error body.
- `src/features/auth/validation.ts`
  - `SignInFormValues`, `SignUpFormValues`, `PasswordRecoveryFormValues`, and `ResetPasswordFormValues` are React Hook Form value types.
- `src/features/auth/components/*/*.types.ts`
  - Props use `ComponentNameProps`.
- `src/routes/routes.enum.ts`
  - `AppRoute` is a concept enum and should not be renamed to `AppRouteEnum`.

## What Not to Change

- Do not rename third-party types such as `TFunction`, `UseFormRegisterReturn`, or React types.
- Do not rename functions, hooks, variables, components, or CSS classes just to match type suffixes.
- Do not move files unless the type is clearly in the wrong architectural layer.
- Do not collapse form values and backend request types when the form has frontend-only fields.
- Do not add `I` prefixes to interfaces.
- Do not use `any` to make a rename compile; fix the concrete type instead.
- Do not rename a type if the new name would collide with an existing declaration. Report the collision and ask for the intended split.
