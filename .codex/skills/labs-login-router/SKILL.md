---
name: labs-login-router
description: Define and implement React Router routes, redirects, route guards, and navigation links for labs-login while centralizing route strings in src/routes/routes.enum.ts.
---

# Labs Login Router Skill

## Purpose
Create and update labs-login routes using React Router while keeping every route path centralized in a shared enum.

## When to Use
Use this skill when adding, changing, reviewing, or wiring app routes, redirects, guarded routes, layout routes, links, or imperative navigation in the labs-login frontend.

## Instructions

1. Read `.codex/instructions.md`, `docs/SRS.md`, and the accepted routing/session ADRs before changing route behavior.
2. Store route strings in `src/routes/routes.enum.ts`.
3. For every new route, add or reuse an enum member:

```ts
export enum AppRoute {
  SignIn = '/sign-in',
  SignUp = '/sign-up',
}
```

4. Do not hardcode route strings in router definitions, redirects, `<Link to>`, `<NavLink to>`, or `navigate(...)` calls when an `AppRoute` member exists.
5. Route-level components belong in `src/pages`; keep feature-specific auth UI and logic under `src/features/auth`.
6. Use React Router for:
   - page route definitions,
   - redirects with `Navigate`,
   - guarded routes,
   - layout routes,
   - navigation links,
   - imperative navigation through `useNavigate`.
7. Preserve SRS-required routes unless the user explicitly changes product scope:
   - `/sign-in`
   - `/sign-up`
   - `/password-recovery`
   - `/reset-password`
   - `/home`
8. Read the reset password token from `?token=<token>` on the reset password route.
9. Redirect successful authentication to `AppRoute.Home`.
10. Keep session checks behind the existing session abstraction; do not read or write auth tokens directly in routing components.
11. Avoid redirect loops. When session state can be loading or unknown, model that state explicitly before redirecting.
12. Update navigation and tests or manual verification notes whenever route names or paths change.

## Output Format

- Summary
- Route enum changes
- Router, redirect, and navigation changes
- Validation performed
- Remaining risks or follow-up work

## Examples

Input:

```text
Add a password recovery route and link to it from sign in.
```

Output:

```text
Add AppRoute.PasswordRecovery = '/password-recovery' in src/routes/routes.enum.ts.
Use AppRoute.PasswordRecovery in the router config and the sign-in page link.
```

Input:

```text
Protect the home page from anonymous users.
```

Output:

```text
Use a guarded route that renders Home when the session is valid and redirects to AppRoute.SignIn otherwise.
Keep session reads inside the session helper or hook.
```
