---
name: labs-integration-backend
description: Enforce labs-login frontend defaults while integrating with backend APIs. Use when adding, changing, or reviewing React frontend behavior that calls the backend, submits forms, handles async button clicks, creates API client methods, or wires auth/backend endpoints. Requires clicked buttons to become disabled, every async button to show src/components/ui/Icons/LoadingIcon.tsx while pending, and backend calls to live in feature api.ts files instead of components.
---

# Labs Integration Backend

## Core Rules

Apply these defaults whenever frontend code integrates with the backend:

- Disable a button immediately after it starts an async click or submit action. Keep it disabled until the request finishes, navigation starts, or ownership transfers to an external redirect.
- Give every backend-triggering button a loading state that renders `src/components/ui/Icons/LoadingIcon.tsx` while pending.
- Create backend API methods in an `api.ts` file. For auth flows, use `src/features/auth/api.ts`. For another feature, use that feature's closest `api.ts`.
- Keep components and pages free of direct `fetch` calls. Components should call feature API functions or hooks that wrap those functions.
- Keep shared HTTP concerns in `src/lib/api.ts` or an established shared API helper, not inside individual components.

## Workflow

1. Read `.codex/instructions.md` before implementation. For auth work, also check `docs/SRS.md` and relevant ADRs, especially backend integration, session, routing, i18n, toast, and provider-login decisions.
2. Locate the feature boundary before coding. Add or update the feature `api.ts` first, then wire components to that method.
3. Model async UI state explicitly with names such as `isSubmitting`, `isLoading`, `pendingAction`, or `pendingProvider`.
4. Disable the clicked control and any mutually exclusive controls while the request is pending.
5. Render `LoadingIcon` in the pending button. Preserve accessible text by keeping the button label or adding an appropriate `aria-label`.
6. Handle backend errors through the project's toast/error helpers. For auth 4xx responses, surface the backend `error` value when available.
7. Run the repository's relevant validation commands when implementation changes are made.

## API Method Pattern

Prefer typed, feature-scoped functions:

```ts
export function submitThing(request: SubmitThingRequest): Promise<SubmitThingResponse> {
  return requestJson<SubmitThingResponse, SubmitThingRequest>({
    body: request,
    endpoint: '/thing',
    method: 'POST',
  })
}
```

Use the existing request helper when available so headers, base URL, language, bearer token, network errors, and backend error parsing stay centralized.

## Button Loading Pattern

Use the existing local style, but maintain these behaviors:

```tsx
<button
  disabled={isSubmitting}
  type="submit"
>
  {isSubmitting ? (
    <LoadingIcon className="button__loading-icon" aria-hidden="true" />
  ) : null}
  <span>{isSubmitting ? t('common.loading') : t('form.submit')}</span>
</button>
```

If `src/components/ui/Icons/LoadingIcon.tsx` is still a raw SVG asset instead of an exported React component, convert it in place to a typed React component before using it. Preserve the spinner SVG and allow `className` and other SVG props.

## Review Checklist

- No backend-triggering button remains clickable while its request is pending.
- Pending buttons show `LoadingIcon`.
- API calls are defined in a feature `api.ts` file.
- Components do not call `fetch` directly.
- Backend responses and errors follow the existing typed response and toast patterns.
- Provider buttons stay disabled or unavailable until a backend OAuth contract exists.
