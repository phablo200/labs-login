---
name: labs-scoped-style
description: Create and maintain component-scoped CSS for labs-login React TypeScript files. Use when adding, moving, reviewing, or changing styles for components or pages under src, especially to keep local CSS out of src/App.css, create ComponentName.css beside ComponentName.tsx, import it directly, and use unique prefixed class names that avoid selector conflicts.
---

# Labs Scoped Style Skill

## Purpose
Keep labs-login styling close to the React component that owns it, reduce growth in `src/App.css`, and prevent class-name collisions as the UI expands.

## Instructions

1. Read `.codex/instructions.md` and `docs/UI_GUIDELINES.md` before creating or changing visual styles.
2. For every styled React `.tsx` component or page, create a same-name CSS file in the same folder:

```text
AuthFormHeader/
├── AuthFormHeader.tsx
├── AuthFormHeader.types.ts
└── AuthFormHeader.css
```

3. Import the component CSS directly from the owning `.tsx` file:

```tsx
import './AuthFormHeader.css'
```

4. Put only global styling in `src/App.css`, including:
   - CSS resets and document-level base styles,
   - `:root`, theme, and design-token variables,
   - `body`, `#root`, and app-shell globals,
   - global third-party library overrides when no component owner exists.
5. Do not add component, page, form, card, button-group, layout-section, or feature-specific rules to `src/App.css`.
6. When editing a component whose local styles currently live in `src/App.css`, move the relevant rules into that component's same-name CSS file as part of the change.
7. Use unique class names derived from the owning component name in kebab case:
   - `AuthFormHeader` -> `auth-form-header`
   - `ProviderButtonGroup` -> `provider-button-group`
   - `SignInPage` -> `sign-in-page`
8. Use the component prefix for the root class and every descendant class:

```tsx
<header className="auth-form-header">
  <p className="auth-form-header__eyebrow">...</p>
  <h1 className="auth-form-header__title">...</h1>
</header>
```

9. Prefer BEM-like descendant and modifier names:
   - block: `auth-form-header`
   - element: `auth-form-header__title`
   - modifier: `auth-form-header--compact`
   - state: `auth-form-header__submit--loading`
10. Avoid generic classes such as `button`, `card`, `title`, `content`, `error`, `active`, `container`, or `form-group` unless they are prefixed by the component block.
11. Keep selectors scoped by class. Do not style bare elements such as `button`, `input`, `section`, or `h1` inside component CSS unless nested under the component root class.
12. Keep component CSS independent of render location. Do not rely on parent page classes unless the parent explicitly owns the layout relationship.
13. Use existing design tokens and CSS variables before hard-coded values. Add new reusable tokens to `src/App.css` only when they are genuinely global.
14. Preserve light and dark mode compatibility by using tokenized colors and checking dark-mode selectors already used by the repo.
15. Continue to use `.styles.ts` only for non-CSS helpers such as class-name maps, variant config, or TypeScript constants. Do not put actual CSS rules in `.styles.ts`.
16. When using `labs-component` or `labs-page-creation`, follow their ownership and folder rules, but use `ComponentName.css` or `PageName.css` for CSS rules instead of creating a `.styles.ts` file for styling.
17. Keep CSS imports direct. Do not create style barrel files.
18. After moving or adding CSS, verify that no duplicate conflicting selectors remain in `src/App.css`.

## Output Format

- Summary
- CSS files created or updated
- `src/App.css` global-only changes, if any
- Class-name prefix used
- Validation performed
- Remaining risks or follow-up work

## Examples

Input:

```text
Create an auth form header component.
```

Output:

```text
Create src/features/auth/components/AuthFormHeader/AuthFormHeader.tsx.
Create src/features/auth/components/AuthFormHeader/AuthFormHeader.css.
Import './AuthFormHeader.css' from AuthFormHeader.tsx.
Use classes such as auth-form-header, auth-form-header__eyebrow, and auth-form-header__title.
Do not add AuthFormHeader styles to src/App.css.
```

Input:

```text
Move sign-in page styles out of App.css.
```

Output:

```text
Create or update src/pages/SignInPage/SignInPage.css.
Import './SignInPage.css' from SignInPage.tsx.
Move only sign-in-page scoped selectors out of src/App.css.
Leave global tokens and root app styles in src/App.css.
```
