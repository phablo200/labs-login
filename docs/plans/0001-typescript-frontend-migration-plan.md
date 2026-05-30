# Plan: TypeScript Frontend Migration

## Source Documents

- Spec: `docs/specs/0001-typescript-frontend-migration.md`
- ADR: `docs/adrs/0001-use-typescript-for-frontend.md`
- Project instructions: `.codex/instructions.md`

## Decisions Confirmed

- Add a dedicated `npm run typecheck` script.
- Keep `npm run dev`; it already exists and should remain unchanged unless TypeScript setup requires adjustment.
- Introduce TypeScript before the feature-based folder migration from ADR 0002.
- Preserve the current starter Vite UI during this migration.
- Do not implement auth screens, routing, or UI redesign in this plan.

## Implementation Steps

### 1. Add TypeScript Tooling

- Add `typescript` as a development dependency if missing.
- Add TypeScript-aware ESLint packages if needed for linting `.ts` and `.tsx`.
- Update `package.json` scripts:
  - Keep `dev`, `build`, `lint`, and `preview`.
  - Add `typecheck`, expected to run TypeScript without emitting files.

### 2. Add Compiler Configuration

- Create TypeScript config files appropriate for Vite:
  - `tsconfig.json`
  - `tsconfig.app.json` if using split app config
  - `tsconfig.node.json` if Vite config needs Node-specific typing
- Enable strict checking.
- Ensure JSX uses the Vite/React-supported transform.
- Ensure no output is emitted during typechecking.

### 3. Add Vite Type Declarations

- Add `src/vite-env.d.ts` if it does not already exist.
- Ensure SVG and PNG imports continue to work for:
  - `src/assets/hero.png`
  - `src/assets/react.svg`
  - `src/assets/vite.svg`

### 4. Convert Entry Files

- Rename `src/App.jsx` to `src/App.tsx`.
- Rename `src/main.jsx` to `src/main.tsx`.
- Update `src/main.tsx` to import `./App`.
- Handle a missing `#root` element explicitly so TypeScript does not allow a nullable root.
- Preserve the current starter UI and styling.

### 5. Add Initial Auth Contract Types

- Create `src/features/auth/types.ts`.
- Define frontend-facing contracts from `docs/SRS.md`:
  - `AuthUser`
  - `SignInRequest`
  - `SignInResponse`
  - `SignUpRequest`
  - `SignUpResponse`
  - `ForgotPasswordRequest`
  - `ResetPasswordRequest`
  - `RequestOtpLoginRequest`
  - `VerifyOtpLoginRequest`
  - `MessageResponse`
  - `AuthErrorResponse`
- Do not implement API calls in this migration.

### 6. Update ESLint

- Extend lint coverage to `js`, `jsx`, `ts`, and `tsx`.
- Preserve existing React Hooks and React Refresh lint behavior.
- Ensure generated build output remains ignored.
- Avoid broad rule churn unrelated to TypeScript migration.

### 7. Update Documentation References

- Update any repository documentation that directly references `src/App.jsx` or `src/main.jsx`.
- Keep documentation changes scoped to the migration.

## Verification

Run these commands after implementation:

```bash
npm run typecheck
npm run lint
npm run build
```

Manual check:

```bash
npm run dev
```

Open the local Vite URL and confirm the starter UI renders without console errors.

## Completion Criteria

- `src/App.jsx` and `src/main.jsx` are removed or renamed.
- `src/App.tsx` and `src/main.tsx` exist and build successfully.
- `npm run typecheck` exists and passes.
- `npm run lint` includes TypeScript files and passes.
- `npm run build` passes.
- `src/features/auth/types.ts` exists and does not use `any`.
- Current Vite starter UI behavior is preserved.

## Deferred Work

- Feature-based folder migration from ADR 0002.
- React Router setup from ADR 0003.
- Auth API module from ADR 0004.
- Form validation implementation from ADR 0005.
- i18n, toast, session, and provider-login behavior from later ADRs/specs.
