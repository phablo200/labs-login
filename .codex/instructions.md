# Codex Project Instructions

## Source of Truth

Before implementing product behavior, read and follow:

- `docs/SRS.md` for functional requirements, backend contracts, validation, i18n, session, and acceptance criteria.
- `docs/UI_GUIDELINES.md` for visual direction, layout, design tokens, component states, accessibility, and dark mode.
- `docs/adrs/` for accepted architecture decisions.
- `AGENTS.md` for contributor workflow and repository commands.

If documents conflict, prefer the most specific accepted decision in this order: ADRs, SRS, UI Guidelines, AGENTS.

## Architecture Rules

This project is intended to become a TypeScript Vite React application.

Use this target structure:

```text
src/
├── assets/
├── components/
│   └── ui/
├── features/
│   └── auth/
│       ├── components/
│       ├── hooks/
│       ├── api.ts
│       └── types.ts
├── hooks/
├── lib/
├── pages/
├── App.tsx
└── main.tsx
```

Keep feature-specific auth code under `src/features/auth`. Keep reusable primitives under `src/components/ui`. Keep shared API setup, session helpers, i18n setup, config, and utilities under `src/lib`. Use `src/pages` for route-level components.

## Required Libraries and Patterns

- Use TypeScript for new app code. Prefer `.tsx` for React components and `.ts` for non-JSX modules.
- Use React Router for page routing.
- Use React Hook Form and Zod for form state and validation.
- Use i18next for English and Portuguese UI copy.
- Use Sonner for toast notifications.
- Prefer Vitest and React Testing Library when adding automated tests.

## Auth and Backend Integration

Centralize auth HTTP calls in `src/features/auth/api.ts`; components should not call `fetch` directly.

Use Vite environment variables:

- `VITE_AUTH_API_BASE_URL`
- `VITE_AUTH_API_KEY`
- `VITE_AUTH_APPLICATION_ID`

Auth requests must include `x-api-key`, `x-application-id`, `Content-Type: application/json`, and `accept-language`. Authenticated requests must include `Authorization: Bearer <token>` when required by the backend.

Backend 4xx responses use `{ error }`; show that value in a toast. Success message endpoints use `{ message }`; show that value where appropriate. Generic 5xx and network failures must use localized fallback copy.

Google and GitHub provider buttons must remain disabled until backend OAuth routes exist.

## Session Rules

The target session model is backend-managed `HttpOnly` cookies. Until supported by the backend, a temporary frontend-managed JWT cookie may be used only behind a narrow helper such as `src/lib/session.ts`.

Do not spread token reads/writes across components. Clear session state on logout, invalid token detection, or failed token validation.

## UI Rules

Build MeLogin with a professional split-auth design inspired by `me-login-1.png`: warm illustrated brand panel on desktop, calm form panel on the right, and single-column mobile screens.

Use the design tokens and component rules in `docs/UI_GUIDELINES.md`. Support light and dark mode. Forms must be accessible, keyboard navigable, responsive, and safe for Portuguese and English text expansion.

Do not implement novelty/skull imagery directly unless explicitly approved; use a more professional illustration direction.

## Quality Gates

Before completing implementation work, run the relevant checks available in the repo:

- `npm run lint`
- `npm run build`
- Test command when configured

If a command cannot be run, report why and what remains unverified.
