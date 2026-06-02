# i18next Internationalization Spec

## Objective

- Implement the frontend internationalization foundation accepted in `docs/adrs/0006-use-i18next-for-internationalization.md`.
- Support English and Portuguese UI copy across the current MeLogin routes and auth layout.
- Persist the selected language and expose it to backend auth requests through the `accept-language` header.
- Make missing or hardcoded user-facing strings easier to detect during development.

## Background

- `docs/SRS.md` requires Portuguese and English UI support, and requires auth requests to include `accept-language` as either `pt` or `en`.
- `docs/UI_GUIDELINES.md` requires a visible or reachable language selector on auth screens and layouts that tolerate longer Portuguese copy.
- The current app has route-level pages under `src/pages`, auth-specific components under `src/features/auth/components`, and routing under `src/routes`.
- User-facing copy is currently hardcoded in pages and auth components, including auth titles, labels, placeholders, navigation links, provider login unavailable text, route placeholder messages, password toggle labels, and not-found copy.
- `package.json` does not yet include `i18next`, `react-i18next`, or browser language detection support.
- `src/features/auth/api.ts` does not exist yet, so this spec should define the language helper that later auth API integration must consume without implementing backend calls.

## Scope

### In Scope

- Install and configure `i18next` and `react-i18next`.
- Add a small language detection and persistence layer that supports:
  - stored preference first,
  - Portuguese browser preference second,
  - English fallback otherwise.
- Support only the locale codes required by the SRS and ADR: `en` and `pt`.
- Add locale resources for current user-facing UI strings in:
  - `AuthLayout`
  - `PasswordField`
  - `ProviderButtons`
  - `SignInPage`
  - `SignUpPage`
  - `PasswordRecoveryPage`
  - `ResetPasswordPage`
  - `HomePage`
  - `NotFoundPage`
- Add a language control that is visible or reachable from auth screens and has an accessible name.
- Update `document.documentElement.lang` whenever the active language changes.
- Persist selected language in local storage with a stable key such as `melogin.language`.
- Expose a typed helper that returns the active backend language value for `accept-language`.
- Add localized fallback strings for generic auth errors and future validation messages so later form/API specs can reuse them.
- Configure development behavior so missing translation keys are visible in the console or rendered output during local development.

### Out of Scope

- Backend changes.
- Full auth API integration, including request execution and toast behavior.
- React Hook Form and Zod validation implementation.
- Sonner toast setup.
- Session persistence and protected route behavior.
- Adding locales beyond English and Portuguese.
- Runtime translation loading from a server.
- Translating non-user-facing developer errors, internal route enum values, CSS class names, or HTML metadata outside the Vite app root.
- Automated test framework setup if it is still not configured when this spec is implemented.

## Proposed Approach

- Add runtime dependencies:
  - `i18next`
  - `react-i18next`
  - `i18next-browser-languagedetector`, unless manual detection is simpler and keeps the bundle smaller.
- Create the i18n setup under `src/lib` because project instructions place shared i18n setup there:
  - `src/lib/i18n.ts` initializes i18next and exports the configured instance.
  - `src/lib/i18n.types.ts` defines `SupportedLanguage = 'en' | 'pt'` if needed by more than one module.
  - `src/lib/language.ts` exposes helpers such as `getStoredLanguage`, `setStoredLanguage`, `resolveInitialLanguage`, `normalizeLanguage`, and `getBackendLanguage`.
- Store resources in TypeScript or JSON files under `src/lib/i18n/`:

```text
src/lib/i18n/
├── resources.ts
└── locales/
    ├── en.json
    └── pt.json
```

- Use `resolveJsonModule` if resources are JSON, which is already enabled in `tsconfig.app.json`.
- Keep resources grouped by stable domains rather than by component implementation detail:
  - `brand`
  - `auth`
  - `routes`
  - `actions`
  - `providers`
  - `validation`
  - `errors`
  - `language`
- Import `src/lib/i18n.ts` once from `src/main.tsx` before rendering React so translations are ready for the app.
- Use `useTranslation()` in pages and components instead of passing literal strings through props where doing so keeps components simple.
- For `AuthLayout`, keep the component reusable by accepting translated `title` and `subtitle` props from pages, but translate its own brand panel and language-control copy internally.
- Add a feature-owned language control component under `src/features/auth/components/LanguageSelector/` if it only appears in auth layout at first. Move it to `src/components` later only when a non-auth page also needs the same control.
- Use a native `<select>` or compact segmented control with an accessible label. The control must not rely only on flag icons.
- Replace all current hardcoded user-facing strings in the in-scope components with translation keys.
- Preserve existing route paths and `AppRoute` usage; route URLs are not localized in this spec.
- Configure i18next with:
  - `fallbackLng: 'en'`
  - `supportedLngs: ['en', 'pt']`
  - `interpolation.escapeValue: false` for React
  - development-only missing key logging or visible key fallback.
- On language changes:
  - call `i18n.changeLanguage(language)`
  - persist the value to local storage
  - update `document.documentElement.lang`
  - ensure `getBackendLanguage()` returns the same normalized value for future API calls.

Impacted files and directories:

- `package.json`
- `package-lock.json`
- `src/main.tsx`
- `src/lib/i18n.ts`
- `src/lib/i18n.types.ts`
- `src/lib/language.ts`
- `src/lib/i18n/`
- `src/features/auth/components/AuthLayout/AuthLayout.tsx`
- `src/features/auth/components/AuthLayout/AuthLayout.types.ts`
- `src/features/auth/components/LanguageSelector/`
- `src/features/auth/components/PasswordField/PasswordField.tsx`
- `src/features/auth/components/ProviderButtons/ProviderButtons.tsx`
- `src/pages/HomePage/HomePage.tsx`
- `src/pages/NotFoundPage/NotFoundPage.tsx`
- `src/pages/PasswordRecoveryPage/PasswordRecoveryPage.tsx`
- `src/pages/ResetPasswordPage/ResetPasswordPage.tsx`
- `src/pages/SignInPage/SignInPage.tsx`
- `src/pages/SignUpPage/SignUpPage.tsx`
- `src/App.css` if language control styles are needed.
- `src/features/auth/api.ts` in a later auth integration spec, where `accept-language` must use the helper from this spec.

## Milestones

1. Add i18next dependencies and create the shared language types, helpers, resources, and i18next initialization files under `src/lib`.
2. Import the i18next setup in `src/main.tsx` and verify the app still renders with the English fallback language.
3. Add English and Portuguese translation resources for the current auth layout, auth pages, route placeholder pages, provider unavailable states, password visibility labels, generic auth errors, and validation message keys.
4. Add a language selector to the auth layout with accessible label text, keyboard support, local storage persistence, and `document.documentElement.lang` synchronization.
5. Replace hardcoded user-facing strings in current pages and auth components with `useTranslation()` calls or translated props.
6. Add or document the `getBackendLanguage()` integration point so future auth requests send `accept-language` consistently.
7. Run static and production checks, then manually verify language switching on all current routes.

## Edge Cases

- Stored local storage value is invalid, unsupported, empty, or corrupted.
- Browser language is `pt-BR`, `pt-PT`, or another Portuguese regional code.
- Browser language is not Portuguese and no stored preference exists.
- Local storage is unavailable or throws because of privacy settings.
- A translation key exists in English but is missing in Portuguese.
- Portuguese labels are longer than English labels and must not overflow buttons, inputs, links, or the auth panel.
- Language changes while the user is already on `/reset-password?token=<token>`; the query token must remain untouched.
- Disabled Google/GitHub buttons must update their text and unavailable explanation without becoming interactive.
- Future backend responses may already be localized; frontend fallback errors must still use the selected local language when the backend omits `error`.

## Acceptance Criteria

- [ ] `i18next` and `react-i18next` are installed and listed in `package.json`.
- [ ] `src/lib/i18n.ts` initializes i18next with `en` and `pt` resources and English fallback behavior.
- [ ] The initial language resolves from stored preference, then Portuguese browser preference, then English fallback.
- [ ] The selected language is persisted under a stable local storage key.
- [ ] Changing language updates visible UI copy without a full page reload.
- [ ] Changing language updates `document.documentElement.lang`.
- [ ] A helper exists for future auth API calls to read the normalized `accept-language` value as `en` or `pt`.
- [ ] Current user-facing copy in auth pages, auth components, route placeholder pages, password toggles, provider unavailable text, and not-found/home placeholders uses translation resources instead of hardcoded strings.
- [ ] Auth screens include a visible or reachable language control with an accessible name.
- [ ] English and Portuguese resources include matching keys for current UI copy.
- [ ] Missing translation keys are detectable during development.
- [ ] Existing internal navigation still uses `AppRoute` values and route URLs remain unchanged.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass.

## Test Plan

- Unit:
  - Test `normalizeLanguage` with `en`, `pt`, `pt-BR`, unsupported languages, empty values, and invalid stored values if a test runner exists.
  - Test `resolveInitialLanguage` preference order when local storage and browser language inputs are controllable.
- Integration:
  - When React Testing Library is configured, render auth pages with the i18n provider and assert English and Portuguese labels after language changes.
  - When `src/features/auth/api.ts` is implemented, mock an auth request and assert `accept-language` matches the selected language.
- Static checks:
  - Run `npm run typecheck`.
  - Run `npm run lint`.
  - Run `npm run build`.
- Manual verification:
  - Run `npm run dev`.
  - Visit `/sign-in`, `/sign-up`, `/password-recovery`, `/reset-password`, `/reset-password?token=test-token`, `/home`, and an unknown route.
  - Switch from English to Portuguese and confirm copy updates on each route.
  - Refresh the browser and confirm the selected language persists.
  - Clear local storage, set the browser language to a Portuguese locale, and confirm Portuguese is selected by default.
  - Clear local storage with a non-Portuguese browser language and confirm English is selected by default.
  - Confirm keyboard navigation reaches and operates the language control.
  - Confirm Portuguese copy does not overlap or clip at desktop width, tablet width, and around `390px` mobile width.
  - Confirm dark mode keeps the language control readable if styles are added.

## Risks and Mitigations

- Risk: Translation keys can become too granular and hard to maintain.
  - Mitigation: Group keys by product domain and screen intent, not by every JSX node.

- Risk: Component props can become noisy if every translated string is passed down from pages.
  - Mitigation: Translate page-specific copy at the page level, and let shared components translate their own stable internal controls.

- Risk: Language detection can surprise users when browser preference and stored preference conflict.
  - Mitigation: Always prefer stored user choice over browser language, and make the selector easy to find on auth screens.

- Risk: Portuguese copy may break the current compact layout.
  - Mitigation: Verify at mobile and desktop widths, avoid fixed text widths, and keep button labels concise.

- Risk: Auth API integration may duplicate language normalization later.
  - Mitigation: Define and reuse the shared `getBackendLanguage()` helper from this spec when `src/features/auth/api.ts` is implemented.

- Risk: Missing translation keys can ship unnoticed.
  - Mitigation: Enable development missing-key logging and include a manual resource key comparison step until automated i18n checks exist.

## Open Questions

- Should the language selector live in the auth layout brand/header area only, or should it become a global app control before non-auth pages are implemented? Recommended: keep it feature-owned in auth layout for now.
- Should locale resources be JSON files or TypeScript objects? Recommended: use JSON resources while `resolveJsonModule` is already enabled, unless typed key inference becomes a priority.
- Should validation message keys be added now even before React Hook Form and Zod are wired? Recommended: add common validation and generic error keys now so later form specs do not invent a second namespace.
