---
name: labs-component
description: Create and organize React TypeScript components for labs-login, choosing shared src/components/ui or feature-specific src/features/<feature-name>/components placement with folder-per-component files and no barrel exports.
---

# Labs Component Skill

## Purpose
Create React TypeScript components in the correct labs-login location while preserving feature ownership, reusable UI boundaries, accessibility, and the accepted UI guidelines.

## When to Use
Use this skill when adding, moving, reviewing, or wiring React components under `src/components`, `src/components/ui`, or `src/features/<feature-name>/components`.

## Instructions

1. Read `.codex/instructions.md`, `docs/UI_GUIDELINES.md`, and the relevant ADRs before creating visual components.
2. Choose the component location by ownership:
   - Use `src/components/ui` for globally reusable UI primitives such as `Button`, `Input`, `Modal`, and `Card`.
   - Use `src/components` for shared non-primitive components that are reusable across features but do not belong in `ui`.
   - Use `src/features/<feature-name>/components` for domain-specific components owned by one feature.
3. For feature-specific components, use the current feature scope. In this repo, auth-specific components belong under `src/features/auth/components`.
4. Create one folder per component:

```text
Button/
├── Button.tsx
├── Button.types.ts
└── Button.styles.ts
```

5. Name components with `PascalCase` and use `.tsx` for JSX files and `.ts` for type/style modules.
6. Do not create barrel exports such as `index.ts`. Import components directly from their component file.
7. Keep props in `ComponentName.types.ts` when the component has a public props contract. Export the props type from that file.
8. Keep component-specific style helpers, class maps, variants, or token mappings in `ComponentName.styles.ts` when styling is non-trivial.
9. Keep component implementation in `ComponentName.tsx` focused on rendering and behavior.
10. Follow existing repository style: functional components, React hooks, ES modules, single quotes, no semicolons, and two-space indentation.
11. Visual components must follow `docs/UI_GUIDELINES.md`:
    - accessible labels and names,
    - visible focus states,
    - disabled and loading states where relevant,
    - light and dark mode token compatibility,
    - responsive layout and text that does not overflow,
    - WCAG 2.1 AA intent for form and auth UI.
12. Prefer established local primitives and patterns before adding new abstractions.
13. Do not place feature-specific business logic in global components.
14. Do not create generic components speculatively; create shared components only when there is clear reuse or an accepted design primitive.
15. Update direct imports wherever a component is added, moved, or renamed.

## Output Format

- Summary
- Component location decision
- Files created or updated
- Accessibility and UI guideline considerations
- Validation performed
- Remaining risks or follow-up work

## Examples

Input:

```text
Create a reusable Button component.
```

Output:

```text
Create src/components/ui/Button/Button.tsx
Create src/components/ui/Button/Button.types.ts
Create src/components/ui/Button/Button.styles.ts
Import it directly from src/components/ui/Button/Button.
```

Input:

```text
Create auth form header and provider button group components.
```

Output:

```text
Create feature-owned components under src/features/auth/components:
AuthFormHeader/AuthFormHeader.tsx
AuthFormHeader/AuthFormHeader.types.ts
AuthFormHeader/AuthFormHeader.styles.ts
ProviderButtonGroup/ProviderButtonGroup.tsx
ProviderButtonGroup/ProviderButtonGroup.types.ts
ProviderButtonGroup/ProviderButtonGroup.styles.ts
```
