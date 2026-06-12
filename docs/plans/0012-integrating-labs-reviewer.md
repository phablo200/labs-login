# Plan: Integrating Labs Reviewer

## Source Spec

Implementation source of truth:

```text
docs/specs/0012-integrating-labs-reviewer.md
```

This plan implements the Labs Reviewer frontend integration against the Python backend at `/home/danii/myProjects/labs-reviewer`. It adds a new `src/features/labs-reviewer` feature, a protected dashboard on `/home`, an initial protected result page at `/review-result?process_id=<process_id>`, labs-reviewer authenticated API calls, `/me` localStorage persistence, and Cypress coverage.

## Decisions To Preserve

- Keep existing auth-service sign-in/sign-up behavior unchanged.
- Use a separate labs-reviewer base URL:

```text
VITE_LABS_REVIEWER_API_BASE_URL
```

- Labs-reviewer requests use `Authorization: Bearer <token>` and `accept-language`.
- Labs-reviewer requests do not send auth-service-only `x-api-key` or `x-application-id`.
- `GET /me` is the protected-route session check for labs-reviewer pages.
- Store successful `/me` responses under:

```text
labs-login.authenticated-user
```

- Clear stored `/me` data whenever session token state is cleared.
- Uploads go to `POST /labs/review` as multipart form data with field name `file`.
- Do not manually set multipart `Content-Type`.
- `/labs/review` returns `process_id`; after success, navigate to:

```text
/review-result?process_id=<process_id>
```

- `GET /labs/processes/{process_id}/status` returns required top-level `status`; use it as the authoritative process state.
- Process status values are:

```text
IN_PROGRESS
FAILED
SUCCEEDED
```

- Process status endpoint never returns agent `result`.
- `GET /labs/agent-process/{agent_process_id}` returns agent `result`.
- Keep the implemented misspelled Markdown endpoint:

```text
GET /outputs/makdown
```

- Output links open in a new tab.
- The first `ReviewResultPage` implementation is a protected shell with query parsing only; detailed result rendering is deferred.
- Use Cypress for frontend behavior tests. Do not add Vitest, Jest, React Testing Library, or unit tests.

## Phase 1: Labs Reviewer Config And Shared API Helpers

Files:

```text
src/lib/config.ts
src/lib/api.ts
src/vite-env.d.ts
```

Steps:

1. Add a `LabsReviewerApiConfig` type with `baseUrl`.
2. Add `getLabsReviewerApiConfig()` reading `VITE_LABS_REVIEWER_API_BASE_URL`.
3. Keep existing `getAuthApiConfig()` behavior unchanged.
4. Extend API helpers so callers can choose the auth-service or labs-reviewer backend.
5. Add a labs-reviewer JSON helper for authenticated `GET` requests.
6. Add a labs-reviewer multipart helper for `POST /labs/review`.
7. Ensure labs-reviewer requests include:

```text
Authorization: Bearer <token>
accept-language
```

8. Ensure labs-reviewer requests do not include:

```text
x-api-key
x-application-id
Content-Type: application/json
```

for multipart uploads.

9. Support FastAPI `{ detail }` error messages in addition to existing auth-service `{ error }` messages.

Deliverable:

- The frontend can call both backend services through shared helpers without direct component `fetch` calls.

## Phase 2: Auth `/me` Integration And User Storage

Files:

```text
src/features/auth/api.ts
src/features/auth/types.ts
src/features/auth/userStorage.ts
src/lib/session.ts
src/routes/ProtectedRoute.tsx
src/pages/HomePage/HomePage.tsx
```

Steps:

1. Add `AuthenticatedUserResponse`:

```ts
type AuthenticatedUserResponse = {
  id: string
  email: string
  profile_id: string
  application_id: string
}
```

2. Add `getMe(token: string)` to the auth feature, backed by labs-reviewer `GET /me`.
3. Create `userStorage.ts` with:

```ts
saveAuthenticatedUser(user)
getStoredAuthenticatedUser()
clearStoredAuthenticatedUser()
```

4. Use the storage key:

```text
labs-login.authenticated-user
```

5. Update `ProtectedRoute` to validate existing sessions through `getMe(token)` instead of auth-service token validation for protected app pages.
6. On successful `/me`, save the returned user and render the route.
7. On missing token, failed `/me`, or 401/403, clear session and stored user, then redirect to `/sign-in`.
8. Update logout to clear both session token and stored user.

Deliverable:

- Protected app pages depend on labs-reviewer session identity and maintain cached user metadata safely.

## Phase 3: Labs Reviewer Feature Types And API

Files:

```text
src/features/labs-reviewer/types.ts
src/features/labs-reviewer/api.ts
```

Steps:

1. Create `src/features/labs-reviewer`.
2. Add these response types:

```ts
type ProcessStatusState = 'IN_PROGRESS' | 'FAILED' | 'SUCCEEDED'

type ReviewUploadResponse = {
  message: string
  process_id: string
  output_file: string
}

type AgentProcessStatusSummary = {
  id: string
  name: string
  status: ProcessStatusState
  loop_from: number | null
  loop_to: number | null
  finished_at: string | null
  children: AgentProcessStatusSummary[]
}

type ProcessStatusResponse = {
  id: string
  file: string
  status: ProcessStatusState
  created_at: string
  user_id: string
  data: AgentProcessStatusSummary[]
}

type AgentProcessStatusDetail = AgentProcessStatusSummary & {
  result: string | null
}

type ReviewOutputItem = {
  filename: string
  path: string
}

type ReviewOutputsResponse = {
  items: ReviewOutputItem[]
  count: number
}
```

3. Add API functions:

```ts
uploadReviewMarkdown(token, file)
getProcessStatus(token, processId)
getAgentProcessStatus(token, agentProcessId)
listMarkdownOutputs(token)
listPdfOutputs(token)
```

4. Call `GET /outputs/makdown` exactly for Markdown outputs.
5. Keep token lookup outside these API functions or pass token explicitly from the hook/page to avoid hidden session reads across feature code.

Deliverable:

- Labs Reviewer backend contracts are typed and isolated in the feature API module.

## Phase 4: Dashboard Hook

Files:

```text
src/features/labs-reviewer/hooks/useLabsReviewerDashboard.ts
```

Steps:

1. Build a hook that owns:
   - selected file state;
   - upload validation;
   - upload pending state;
   - output list state;
   - output refresh pending state;
   - process status polling state when a process is active;
   - selected agent detail state.
2. Validate that selected files end in `.md`.
3. On upload:
   - require a session token;
   - call `uploadReviewMarkdown`;
   - show the backend `message`;
   - refresh output lists;
   - navigate to `/review-result?process_id=<process_id>`.
4. Poll process status only when the dashboard or future result UI has an active `process_id`.
5. Use `ProcessStatusResponse.status` as authoritative:
   - keep polling while `IN_PROGRESS`;
   - stop on `SUCCEEDED` or `FAILED`;
   - stop on timeout or unmount.
6. Keep the initial polling interval at 3 seconds.
7. Keep the timeout at 10 minutes.
8. Fetch agent detail on demand through `getAgentProcessStatus`.

Deliverable:

- Dashboard behavior is centralized in a feature hook, with components kept mostly presentational.

## Phase 5: Dashboard Components

Files:

```text
src/features/labs-reviewer/components/ReviewUploadPanel/ReviewUploadPanel.tsx
src/features/labs-reviewer/components/ReviewUploadPanel/ReviewUploadPanel.types.ts
src/features/labs-reviewer/components/ProcessStatusTree/ProcessStatusTree.tsx
src/features/labs-reviewer/components/ProcessStatusTree/ProcessStatusTree.types.ts
src/features/labs-reviewer/components/AgentProcessDetailPanel/AgentProcessDetailPanel.tsx
src/features/labs-reviewer/components/AgentProcessDetailPanel/AgentProcessDetailPanel.types.ts
src/features/labs-reviewer/components/ReviewOutputsPanel/ReviewOutputsPanel.tsx
src/features/labs-reviewer/components/ReviewOutputsPanel/ReviewOutputsPanel.types.ts
```

Steps:

1. Implement `ReviewUploadPanel`:
   - visible file input label;
   - `.md` accept hint;
   - selected filename;
   - inline validation errors;
   - submit button disabled until valid file exists;
   - `LoadingIcon` while upload is pending.
2. Implement `ProcessStatusTree`:
   - process-level status heading/badge;
   - process file, creation date, and process id;
   - recursive nested agent rows;
   - status labels for `IN_PROGRESS`, `FAILED`, and `SUCCEEDED`;
   - loop metadata like `1/3` when present;
   - details button for each agent process.
3. Implement `AgentProcessDetailPanel`:
   - status metadata;
   - result content in a scrollable region;
   - empty result state for `null`;
   - loading and error states.
4. Implement `ReviewOutputsPanel`:
   - Markdown and PDF sections;
   - empty states;
   - refresh button disabled/loading while pending;
   - links built from labs-reviewer base URL plus returned `path`;
   - output links use `target="_blank"` and `rel="noreferrer"`.

Deliverable:

- The feature has reusable UI components matching the dashboard workflow and backend state model.

## Phase 6: Route Pages

Files:

```text
src/pages/HomePage/HomePage.tsx
src/pages/ReviewResultPage/ReviewResultPage.tsx
src/routes/routes.enum.ts
src/routes/router.tsx
```

Steps:

1. Replace the placeholder `/home` page with the Labs Reviewer dashboard.
2. Keep logout available in the dashboard header.
3. Show stored user email when available.
4. Add:

```ts
AppRoute.ReviewResult = '/review-result'
```

5. Register `/review-result` behind `ProtectedRoute`.
6. Create `ReviewResultPage`:
   - read `process_id` using React Router query access;
   - if present, render a protected shell with the process id and placeholder result content;
   - if missing, render localized empty state and a link back to `/home`.
7. Defer final result rendering and any result-specific backend calls not already defined in this spec.

Deliverable:

- Users can upload from `/home` and land on a refresh-safe `/review-result?process_id=<process_id>` URL.

## Phase 7: I18n And Styling

Files:

```text
src/lib/i18n/locales/en.json
src/lib/i18n/locales/pt.json
src/App.css
```

Steps:

1. Add English and Portuguese copy for:
   - dashboard title/subtitle;
   - upload panel;
   - validation errors;
   - upload success and failure;
   - process status labels;
   - agent detail states;
   - output list states;
   - result page shell;
   - missing `process_id` state.
2. Add CSS for:
   - dashboard layout;
   - upload controls;
   - process status rows;
   - nested agent indentation;
   - status badges;
   - output lists;
   - result page shell.
3. Use existing design tokens.
4. Keep mobile single-column.
5. Use desktop main/side or two-column layout without nested cards.
6. Ensure text fits in controls for English and Portuguese.

Deliverable:

- The dashboard and result page are localized, responsive, and visually aligned with the app.

## Phase 8: Cypress Coverage

Files:

```text
cypress/support/authResponses.ts
cypress/support/commands.ts
cypress/support/index.d.ts
cypress/e2e/auth/protected-route.cy.ts
cypress/e2e/labs-reviewer/*.cy.ts
```

Steps:

1. Use the `labs-automated-tests` subagent during implementation to create/update automated tests.
2. Add Cypress fixtures/helpers for:
   - `/me` response;
   - upload response with `process_id`;
   - process status response with top-level `status`;
   - agent detail response;
   - Markdown/PDF outputs.
3. Update protected-route tests:
   - anonymous redirect;
   - `/me` bearer header;
   - localStorage write;
   - 401/403 cleanup.
4. Add dashboard tests:
   - output lists load;
   - invalid file does not call backend;
   - valid `.md` upload sends multipart `file`;
   - upload button disables and renders `LoadingIcon`;
   - upload success navigates to `/review-result?process_id=<process_id>`.
5. Add process status tests:
   - `IN_PROGRESS` keeps polling;
   - `SUCCEEDED` stops polling;
   - `FAILED` stops polling and remains visible;
   - nested agent rows and loop metadata render.
6. Add agent detail tests:
   - details action calls `/labs/agent-process/{id}`;
   - result content renders;
   - null result empty state renders.
7. Add result page tests:
   - protected route behavior;
   - present `process_id` shell;
   - missing `process_id` empty state and navigation back to `/home`.
8. Add output link assertions:
   - Markdown uses `/outputs/makdown`;
   - links open with `target="_blank"`;
   - links include `rel="noreferrer"`.
9. Run practical accessibility checks with existing Cypress axe helper.

Deliverable:

- Browser tests cover the new feature behavior and the changed protected-route session validation.

## Phase 9: Verification

Automated commands:

```bash
npm run lint
npm run build
npm run test:e2e
```

Manual checks:

1. Start labs-reviewer with MongoDB reachable.
2. Start the frontend on a backend-allowed origin or update backend CORS separately.
3. Sign in through the frontend with a token accepted by labs-reviewer.
4. Visit `/home` and confirm `/me` stores `labs-login.authenticated-user`.
5. Upload a UTF-8 `.md` file.
6. Confirm the upload request is multipart and the response includes `process_id`.
7. Confirm navigation to `/review-result?process_id=<process_id>`.
8. Confirm `/review-result` is protected and preserves the process id on refresh.
9. Confirm process status polling uses top-level `status`.
10. Confirm agent detail result loads from `/labs/agent-process/{agent_process_id}`.
11. Confirm Markdown output calls `/outputs/makdown`.
12. Confirm output links open in a new tab.
13. Confirm logout clears both cookie and stored user.

## Rollback Plan

1. Revert route registration for `/review-result`.
2. Restore the previous `/home` placeholder if dashboard routing blocks auth flows.
3. Remove labs-reviewer feature imports from route pages.
4. Keep existing auth-service pages and auth API untouched.
5. Revert labs-reviewer config/API helpers if they break build.

## Definition Of Done

- `src/features/labs-reviewer` contains typed API, types, hook, and components.
- `/home` is an authenticated Labs Reviewer dashboard.
- `/review-result?process_id=<process_id>` exists as an authenticated initial result-page shell.
- `/me` validates protected pages and stores user data in localStorage.
- Logout and auth failures clear session and stored user data.
- Uploads call `POST /labs/review` with multipart `file`.
- Successful upload navigates with `process_id` in the query string.
- Process status uses required top-level `ProcessStatusResponse.status`.
- Agent detail result is fetched only from `/labs/agent-process/{agent_process_id}`.
- Markdown outputs use `/outputs/makdown`.
- Output links open in a new tab.
- English and Portuguese copy is present.
- Cypress coverage is updated.
- `npm run lint`, `npm run build`, and `npm run test:e2e` pass.
