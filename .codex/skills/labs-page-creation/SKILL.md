---
name: labs-page-creation
description: Create and organize React route-level pages for labs-login under src/pages, using folder-per-page structure, labs-login-router for route wiring, and labs-component for extracted components.
---

# Labs Page Creation Skill

## Purpose
Create route-level React TypeScript pages for labs-login while keeping pages thin, routes centralized, and reusable or feature-specific UI extracted through the component conventions.

## When to Use
Use this skill when adding, moving, reviewing, or wiring pages under `src/pages`.

## Instructions

1. Read `.codex/instructions.md`, `docs/SRS.md`, `docs/UI_GUIDELINES.md`, and relevant ADRs before creating product pages.
2. Use `labs-login-router` for route enum updates, router wiring, redirects, links, and navigation behavior.
3. Use `labs-component` when extracting page UI into shared or feature-specific components.
4. Create each page as a folder under `src/pages` and require the page name to end with `Page`:

```text
src/pages/SignInPage/
├── SignInPage.tsx
├── SignInPage.types.ts
└── SignInPage.styles.ts
```

5. Create `PageName.types.ts` only when the page has a meaningful local type contract.
6. Create `PageName.styles.ts` only when page-specific style helpers, class maps, layout constants, or token mappings are non-trivial.
7. Keep `PageName.tsx` focused on route-level composition:
   - read route params or search params,
   - connect page-level layout,
   - compose feature and shared components,
   - perform route-level redirects only when required.
8. Keep page-level business logic thin. Put feature behavior under `src/features/<feature-name>` and shared hooks/utilities under the accepted shared folders.
9. Page markup may live directly in the page when it is small and route-specific. Extract non-trivial, reusable, or domain-specific UI with `labs-component`.
10. For auth-specific page UI, prefer components under `src/features/auth/components` unless the component is a reusable global primitive.
11. Every new routed page must have:
    - a `Page`-suffixed component,
    - a route enum member,
    - router wiring,
    - direct imports with no barrel exports,
    - safe handling for required params or query strings.
12. Follow existing repository style: functional components, React hooks, TypeScript, ES modules, single quotes, no semicolons, and two-space indentation.
13. Visual pages must follow `docs/UI_GUIDELINES.md`, including accessibility, dark mode compatibility, responsive layout, and text that does not overflow.
14. Do not implement backend calls, session changes, or full feature behavior unless the page request explicitly includes that scope.

## Output Format

- Summary
- Page location and route decision
- Route enum and router changes
- Component extraction decisions
- Files created or updated
- Validation performed
- Remaining risks or follow-up work

## Examples

Input:

```text
Create a reset password page that reads the token query parameter.
```

Output:

```text
Create src/pages/ResetPasswordPage/ResetPasswordPage.tsx.
Use labs-login-router to add or reuse AppRoute.ResetPassword and wire the route.
Read ?token=<token> safely in the page and render token-present or missing-token states.
Extract larger form UI with labs-component when the form is implemented.
```

Input:

```text
Create the sign-in page with a small auth form header.
```

Output:

```text
Create src/pages/SignInPage/SignInPage.tsx.
Use labs-login-router to add or reuse AppRoute.SignIn and wire the route.
If the header grows beyond route composition, use labs-component to create src/features/auth/components/AuthFormHeader/AuthFormHeader.tsx.
```
