# Repository Guidelines

## Project Instructions

Before coding, read `.codex/instructions.md`. It summarizes the current architecture decisions and links the required source documents: `docs/SRS.md`, `docs/UI_GUIDELINES.md`, and `docs/adrs/`.

## Project Structure & Module Organization

This is a Vite React app that is being migrated to TypeScript. Target source layout is feature-based: shared UI primitives in `src/components/ui`, auth-specific code in `src/features/auth`, shared hooks in `src/hooks`, utilities/config/session/i18n in `src/lib`, and route-level components in `src/pages`. Static assets live in `public/` or `src/assets/` depending on whether they are imported by code.

## Build, Test, and Development Commands

- `npm run dev`: start the Vite development server with hot module replacement.
- `npm run build`: create a production build in `dist/`.
- `npm run preview`: serve the production build locally for verification.
- `npm run lint`: run ESLint across the project.

Run `npm install` after cloning or when `package-lock.json` changes.

## Coding Style & Naming Conventions

Use TypeScript for new app code: `.tsx` for React components and `.ts` for non-JSX modules. Use functional components, React hooks, `PascalCase` component names, and `camelCase` variables/functions. Follow the existing style of ES modules, single quotes, no semicolons, and two-space indentation until a formatter changes it consistently.

## Architecture & UI Requirements

Follow the accepted ADRs in `docs/adrs/`: React Router, React Hook Form + Zod, i18next, Sonner, isolated auth API integration, and cookie-backed session abstraction. Follow `docs/UI_GUIDELINES.md` for MeLogin visuals: professional split desktop layout, single-column mobile flow, light/dark mode tokens, accessible form states, and disabled Google/GitHub buttons until backend OAuth exists.

## Testing Guidelines

No automated test runner is currently configured. For now, validate changes with `npm run lint`, `npm run build`, and manual browser checks. When adding tests, prefer Vitest and React Testing Library. Place tests near covered code with names like `SignInForm.test.tsx` or `session.test.ts`.

## Commit & Pull Request Guidelines

Git history is not available in this workspace, so use concise, imperative commit messages such as `Add auth routing` or `Fix password reset validation`. Pull requests should include a short summary, testing notes, linked issues when available, and screenshots or screen recordings for visible UI changes.

## Security & Configuration Tips

Do not commit secrets, tokens, or environment-specific credentials. Use Vite variables prefixed with `VITE_` for frontend configuration. Centralize auth calls and session reads/writes; do not spread token handling across components.
