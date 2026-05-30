# TypeScript Frontend Migration Spec

## Objective

- Migrate the MeLogin frontend from JavaScript React files to TypeScript React files in accordance with `docs/adrs/0001-use-typescript-for-frontend.md`.
- Establish strict, maintainable typing for app entry points, React components, asset imports, and initial auth API contracts without implementing full authentication flows yet.

## Background

- The current app is a Vite React project using `src/App.jsx` and `src/main.jsx`.
- `package.json` already includes React type packages, but the project does not have TypeScript configured.
- `eslint.config.js` currently targets only `js` and `jsx` files.
- ADR 0001 requires `.tsx` for React components, `.ts` for non-JSX modules, strict TypeScript configuration, and auth contract types under feature modules.

## Scope

### In Scope

- Add TypeScript configuration for a Vite React app.
- Rename `src/App.jsx` to `src/App.tsx`.
- Rename `src/main.jsx` to `src/main.tsx`.
- Update imports that reference `.jsx` files.
- Add Vite-compatible type declarations for imported assets when needed.
- Update ESLint configuration to lint `ts` and `tsx`.
- Add initial auth type definitions in `src/features/auth/types.ts` based on `docs/SRS.md`.
- Update documentation references that still point to `.jsx` entry files when directly affected.

### Out of Scope

- Implementing sign in, sign up, password recovery, or routing behavior.
- Installing React Router, React Hook Form, Zod, i18next, Sonner, or test libraries unless required by a separate spec.
- Rebuilding the UI according to `docs/UI_GUIDELINES.md`.
- Changing backend contracts.
- Adding complete test coverage for auth flows.

## Proposed Approach

- Add TypeScript as a development dependency if missing.
- Add `tsconfig.json` and, if useful for Vite conventions, `tsconfig.app.json` and `tsconfig.node.json`.
- Use strict compiler settings, including `strict`, `noUnusedLocals`, `noUnusedParameters`, and modern JSX support.
- Add or preserve `vite-env.d.ts` so image and SVG imports type correctly.
- Convert `src/main.jsx` to `src/main.tsx` and guard the root element lookup so TypeScript does not allow a nullable root.
- Convert `src/App.jsx` to `src/App.tsx` with explicit component typing only where it improves clarity; avoid noisy annotations for obvious local inference.
- Create `src/features/auth/types.ts` with initial request and response types:
  - `SignInRequest`, `SignInResponse`
  - `SignUpRequest`, `SignUpResponse`
  - `ForgotPasswordRequest`, `MessageResponse`
  - `ResetPasswordRequest`
  - `VerifyOtpLoginRequest`, `RequestOtpLoginRequest`
  - `AuthUser`
  - `AuthErrorResponse`
- Keep these as frontend-facing contracts; do not import backend source files.
- Update `eslint.config.js` to include TypeScript parsing/linting once the relevant packages are installed.

Impacted files and directories:

- `package.json`
- `package-lock.json`
- `tsconfig*.json`
- `eslint.config.js`
- `src/App.tsx`
- `src/main.tsx`
- `src/vite-env.d.ts`
- `src/features/auth/types.ts`
- `AGENTS.md` if command or naming guidance needs adjustment

## Milestones

1. Add TypeScript tooling and compiler configuration.
2. Convert app entry files from `.jsx` to `.tsx` and update imports.
3. Add initial auth contract types under `src/features/auth/types.ts`.
4. Update ESLint to include TypeScript files.
5. Run lint and production build; fix migration issues.

## Edge Cases

- `document.getElementById('root')` can return `null`; implementation must handle this explicitly.
- Image imports such as `hero.png`, `react.svg`, and `vite.svg` must remain valid after TypeScript migration.
- JSX runtime settings must match Vite React expectations.
- ESLint must not silently ignore `.ts` and `.tsx` files.
- Strict typing may surface unused variables from the current starter UI; remove or type them intentionally.

## Acceptance Criteria

- [ ] `src/App.jsx` no longer exists and is replaced by `src/App.tsx`.
- [ ] `src/main.jsx` no longer exists and is replaced by `src/main.tsx`.
- [ ] `npm run build` completes successfully with TypeScript enabled.
- [ ] `npm run lint` checks `.ts` and `.tsx` files.
- [ ] TypeScript config uses strict checking.
- [ ] `src/features/auth/types.ts` exists with typed request, response, user, and error contracts for the auth endpoints listed in `docs/SRS.md`.
- [ ] No app code uses `any` for auth request or response contracts.
- [ ] Asset imports continue to work in the Vite build.

## Test Plan

- Unit: not required for this migration unless utility logic is introduced.
- Integration: run `npm run build` to verify TypeScript, Vite, JSX, and asset import compatibility.
- Static analysis: run `npm run lint` and confirm TypeScript files are included.
- Manual verification: run `npm run dev`, open the app, and confirm the starter screen renders without console errors.

## Risks and Mitigations

- Risk: TypeScript ESLint setup may require additional packages.
  - Mitigation: Install the minimal official packages needed for ESLint flat config and keep config scoped to current files.

- Risk: Strict TypeScript may block migration on unrelated starter code issues.
  - Mitigation: Keep the initial conversion small and remove unused starter code only when required by checks.

- Risk: Auth contract types may drift from the backend.
  - Mitigation: Base initial types on `docs/SRS.md` and update them whenever backend endpoint contracts change.

- Risk: Temporary JavaScript files may remain after migration.
  - Mitigation: Verify with `rg --files src` and remove replaced `.jsx` entry files after successful conversion.

## Open Questions

- Should a dedicated `npm run typecheck` script be added, or should `npm run build` remain the only TypeScript check for now? You should add, and levarage to add an `npm run dev`, if this does not exist.
- Should TypeScript be introduced before or together with the feature-based folder migration from ADR 0002? Before, I'll do it spec by spec.
- Should starter Vite UI be preserved during migration or replaced by the first MeLogin screen in a later spec? We can keep Vite UI, I'll do it spec by spec, for now let's migrate to typescript.
