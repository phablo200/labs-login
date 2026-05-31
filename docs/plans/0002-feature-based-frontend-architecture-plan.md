# Plan: Feature-Based Frontend Architecture

## Source Documents

- ADR: `docs/adrs/0002-use-feature-based-frontend-architecture.md`
- Previous plan: `docs/plans/0001-typescript-frontend-migration-plan.md`
- Project instructions: `.codex/instructions.md`

## Goal

Move the TypeScript Vite app toward the accepted feature-based source structure without implementing auth behavior, routing, form libraries, i18n, toasts, or session logic from later ADRs.

## Current State

The app currently has:

```text
src/
├── App.css
├── App.tsx
├── assets/
├── features/
│   └── auth/
│       └── types.ts
├── index.css
├── main.tsx
└── vite-env.d.ts
```

The target architecture requires shared UI, feature modules, shared hooks, shared library utilities, and route-level pages.

## Implementation Steps

### 1. Create Architecture Directories

Create the target top-level folders:

- `src/components/ui`
- `src/features/auth/components`
- `src/features/auth/hooks`
- `src/hooks`
- `src/lib`
- `src/pages`

Use `.gitkeep` files only if a directory would otherwise be empty and needs to be retained before code exists.

### 2. Establish Page Boundary

- Create `src/pages/StarterPage.tsx` or `src/pages/HomePage.tsx` for the existing starter screen.
- Move the current starter screen markup out of `src/App.tsx` into that page component.
- Keep `src/App.tsx` as the application shell that renders the page.
- Preserve current visual behavior and CSS unless a path update is required.

Recommended naming for this migration: `StarterPage.tsx`, because the real `/home` route is not implemented yet.

### 3. Keep Feature Ownership Clear

- Keep `src/features/auth/types.ts` in place.
- Add `src/features/auth/index.ts` only if it improves import boundaries for existing code.
- Do not add `api.ts`, hooks, forms, or auth components yet unless they are empty placeholders required for directory retention.

### 4. Add Shared Module Boundaries

- Add `src/components/ui/.gitkeep`, `src/hooks/.gitkeep`, and `src/lib/.gitkeep` if no real shared code is introduced.
- Do not create generic helpers without actual usage.
- Avoid premature abstraction.

### 5. Update Imports and References

- Update `src/App.tsx` imports after moving the starter page.
- Ensure asset imports still resolve from the new page location.
- Update any documentation that describes current source structure if it becomes misleading.

### 6. Verify

Run:

```bash
npm run typecheck
npm run lint
npm run build
```

Manual check:

```bash
npm run dev
```

Confirm the current starter UI still renders.

## Completion Criteria

- Target architecture folders exist.
- `src/App.tsx` is a thin app shell.
- Existing starter screen is isolated under `src/pages`.
- `src/features/auth/types.ts` remains the only auth implementation artifact.
- No routing, auth API, form validation, i18n, toast, or session behavior is implemented in this plan.
- Typecheck, lint, and build pass.

## Deferred Work

- React Router route setup from ADR 0003.
- Auth API module from ADR 0004.
- React Hook Form and Zod validation from ADR 0005.
- i18next setup from ADR 0006.
- Sonner setup from ADR 0007.
- Session abstraction from ADR 0008.
- Provider login UI behavior from ADR 0009.
- Test framework setup from ADR 0010.

## Risks and Mitigations

- Risk: Empty folders are not tracked by Git.
  - Mitigation: Use `.gitkeep` only for approved architecture directories with no implementation files yet.

- Risk: Moving starter UI creates unnecessary churn.
  - Mitigation: Move only the component boundary; preserve markup, styles, and assets.

- Risk: Future routing may require another page rename.
  - Mitigation: Use neutral `StarterPage` naming until ADR 0003 defines route behavior in implementation.
