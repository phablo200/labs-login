# Spec: Integrating Labs Reviewer

## Objective

- Build the frontend integration for the Python labs-reviewer backend under `/home/danii/myProjects/labs-reviewer`.
- After sign-in, turn `/home` into the authenticated Labs Reviewer dashboard where a user uploads a UTF-8 `.md` file, receives a `process_id`, stores that id in the URL query flow, tracks the MongoDB-backed process/agent status tree, opens individual agent results, and inspects generated Markdown/PDF outputs.
- Add an initial protected result page at `/review-result?process_id=<process_id>`. The first implementation only needs the route/page shell and query parameter handling; result-page content will be specified later.
- Add support for labs-reviewer `GET /me`, store the authenticated-user payload in `localStorage` through a narrow helper, and clear it whenever the session is cleared.

## Background

- The current `me-login` frontend is a Vite React TypeScript app. Auth API calls live in `src/features/auth/api.ts`, shared HTTP/config/session helpers live under `src/lib`, route-level pages live under `src/pages`, and `/home` is currently a protected placeholder page.
- The backend docs reviewed for this spec are:
  - `/home/danii/myProjects/labs-reviewer/docs/specs/mongodb-and-process-setup.md`
  - `/home/danii/myProjects/labs-reviewer/docs/plans/mongodb-and-process-setup.md`
  - `/home/danii/myProjects/labs-reviewer/docs/specs/process-status-and-agent-process-status-integration.md`
  - `/home/danii/myProjects/labs-reviewer/docs/plans/process-status-and-agent-process-status-integration.md`
  - `/home/danii/myProjects/labs-reviewer/docs/specs/process-status-new-column-status.md`
  - `/home/danii/myProjects/labs-reviewer/docs/plans/process-status-new-column-status.md`
- The backend implementation has moved Labs orchestration into `labs/agents`. The active upload router is `/home/danii/myProjects/labs-reviewer/labs/agents/router.py`, not the old `labs/router.py`.
- The backend now has MongoDB-backed process tracking under `/home/danii/myProjects/labs-reviewer/labs/process_status`.
- Backend routes are protected by `Authorization: Bearer <token>` through `get_current_user`. Labs-reviewer does not use the existing auth-service `x-api-key` and `x-application-id` headers.
- `POST /labs/review` now creates a `ProcessStatus` document before background processing starts and returns `process_id`.
- `GET /labs/processes/{process_id}/status` returns the process and nested agent-process status tree without agent `result`.
- The backend now exposes top-level `ProcessStatus.status` with `IN_PROGRESS`, `FAILED`, and `SUCCEEDED`. Frontend code must use that returned field as the authoritative process state.
- `GET /labs/agent-process/{agent_process_id}` returns one agent-process detail with nested children and includes `result`.
- Existing output list endpoints remain available:
  - `GET /outputs/makdown`, with the misspelled path preserved for now.
  - `GET /outputs/pdf`.
- The backend CORS allowlist currently includes ports such as `4004`, `4009`, `4010`, and `8080`; it does not include the current Vite e2e port `5173`.

## Scope

### In Scope

- Create a new frontend feature folder at `src/features/labs-reviewer`.
- Add a separate labs-reviewer API base config, for example `VITE_LABS_REVIEWER_API_BASE_URL=http://127.0.0.1:3015`.
- Keep existing auth-service sign-in/sign-up behavior unchanged.
- Add labs-reviewer API functions for:
  - `GET /me`;
  - `POST /labs/review`;
  - `GET /labs/processes/{process_id}/status`;
  - `GET /labs/agent-process/{agent_process_id}`;
  - `GET /outputs/makdown`;
  - `GET /outputs/pdf`.
- Store `GET /me` response data in `localStorage` under one stable key through a centralized helper.
- Replace the placeholder `/home` page with an authenticated Labs Reviewer dashboard.
- Add a protected route-level result page at `/review-result`.
- Persist the active `process_id` in the URL as `?process_id=<process_id>` so refreshes and shared links preserve process context.
- Allow selecting and uploading one `.md` file to `/labs/review`.
- Display the returned `process_id` and poll process status while work is in progress.
- Render nested agent-process statuses, including top-level and child records.
- Let users open an agent-process detail view to read the `result` returned by `GET /labs/agent-process/{agent_process_id}`.
- Show Markdown and PDF output lists from the existing output endpoints, with links opening in a new tab.
- Add English and Portuguese UI copy for dashboard, upload, status, output, error, empty, and loading states.
- Update Cypress tests for the protected route, `/me` storage, upload flow, process polling, agent detail, output lists, loading states, and failure states.

### Out of Scope

- Backend changes in `/home/danii/myProjects/labs-reviewer`.
- Renaming `/outputs/makdown` to `/outputs/markdown`; keep using the implemented `/outputs/makdown` route for now.
- Implementing file deletion, file preview rendering, download authentication changes, or output ownership filtering.
- Implementing a queue/job status endpoint beyond the existing process status endpoints.
- Changing auth-service sign-in/sign-up contracts.
- Adding Vitest, Jest, React Testing Library, or frontend unit tests.

## Proposed Approach

### Backend Contracts

Use the implemented backend contracts below as source of truth.

#### `GET /me`

Request:

```text
Authorization: Bearer <token>
```

Response:

```ts
type AuthenticatedUserResponse = {
  id: string
  email: string
  profile_id: string
  application_id: string
}
```

Frontend behavior:

- Use this endpoint as the authenticated labs-reviewer session check for `/home`.
- Store successful responses in `localStorage`.
- Clear the stored user on logout, missing token, or any 401/403 response.

#### `POST /labs/review`

Request:

```text
Authorization: Bearer <token>
Content-Type: multipart/form-data; boundary=<browser-generated>
file=<selected .md file>
```

Do not set `Content-Type` manually for this request.

Response:

```ts
type ReviewUploadResponse = {
  message: string
  process_id: string
  output_file: string
}
```

Frontend behavior:

- Validate the selected file extension client-side before upload.
- Disable the upload button and render `LoadingIcon` while pending.
- On success, show `message`, capture `process_id`, refresh output lists, and navigate to `/review-result?process_id=<process_id>`.

#### `GET /labs/processes/{process_id}/status`

Response:

```ts
type AgentProcessStatusState = 'IN_PROGRESS' | 'FAILED' | 'SUCCEEDED'
type ProcessStatusState = AgentProcessStatusState

type AgentProcessStatusSummary = {
  id: string
  name: string
  status: AgentProcessStatusState
  loop_from: number | null
  loop_to: number | null
  finished_at: string | null
  children: AgentProcessStatusSummary[]
}

type ProcessStatusResponse = {
  id: string
  file: string
  created_at: string
  user_id: string
  status: ProcessStatusState
  data: AgentProcessStatusSummary[]
}
```

Important contract rule:

- This endpoint must not return `result`; the frontend must not expect it here.

Frontend behavior:

- Poll this endpoint after a successful upload.
- Use top-level `status` as the authoritative process state.
- Continue polling while `status === 'IN_PROGRESS'`.
- Stop polling when `status` is `SUCCEEDED` or `FAILED`, when the user uploads another file, when the component unmounts, or after a bounded timeout.
- Recommended initial polling interval: 3 seconds.
- Recommended timeout: 10 minutes, because LLM/PDF generation can be slow.

#### `GET /labs/agent-process/{agent_process_id}`

Response:

```ts
type AgentProcessStatusDetail = {
  id: string
  name: string
  status: AgentProcessStatusState
  loop_from: number | null
  loop_to: number | null
  finished_at: string | null
  children: AgentProcessStatusSummary[]
  result: string | null
}
```

Frontend behavior:

- Show an action on each rendered agent-process row to open details.
- Fetch details on demand.
- Display `result` in a readable, scrollable panel or modal.
- Preserve line breaks and Markdown-like content formatting.
- Show a localized empty result state when `result` is `null`.

#### `GET /outputs/makdown` and `GET /outputs/pdf`

Response:

```ts
type ReviewOutputItem = {
  filename: string
  path: string
}

type ReviewOutputsResponse = {
  items: ReviewOutputItem[]
  count: number
}
```

Frontend behavior:

- Keep the endpoint path exactly as `/outputs/makdown`.
- Show separate Markdown and PDF lists.
- Build output links from `VITE_LABS_REVIEWER_API_BASE_URL + '/' + item.path`.
- Open output links in a new tab with `target="_blank"` and `rel="noreferrer"`.
- Refresh output lists on dashboard load, after upload success, when status polling completes, and when the user clicks refresh.

### Frontend Architecture

Add this feature structure:

```text
src/features/labs-reviewer/
├── api.ts
├── types.ts
├── components/
│   ├── AgentProcessDetailPanel/
│   │   ├── AgentProcessDetailPanel.tsx
│   │   └── AgentProcessDetailPanel.types.ts
│   ├── ProcessStatusTree/
│   │   ├── ProcessStatusTree.tsx
│   │   └── ProcessStatusTree.types.ts
│   ├── ReviewOutputsPanel/
│   │   ├── ReviewOutputsPanel.tsx
│   │   └── ReviewOutputsPanel.types.ts
│   └── ReviewUploadPanel/
│       ├── ReviewUploadPanel.tsx
│       └── ReviewUploadPanel.types.ts
└── hooks/
    └── useLabsReviewerDashboard.ts
```

Keep route-level composition in `src/pages/HomePage/HomePage.tsx`. The page should import feature components/hooks, not contain direct fetch calls.

Add a new route-level page:

```text
src/pages/ReviewResultPage/
└── ReviewResultPage.tsx
```

Route rules:

- Add `AppRoute.ReviewResult = '/review-result'` in `src/routes/routes.enum.ts`.
- Register `/review-result` in `src/routes/router.tsx` behind `ProtectedRoute`.
- Read `process_id` from the query string.
- If `process_id` is missing, show a localized empty state and a link back to `/home`.
- For the first implementation, the result page can be an empty protected shell that confirms the process id is present. Detailed result rendering is deferred.

### HTTP And Config

- Extend `src/lib/config.ts` with labs-reviewer config:

```ts
type LabsReviewerApiConfig = {
  baseUrl: string
}
```

- Add a required Vite variable:

```text
VITE_LABS_REVIEWER_API_BASE_URL
```

- Extend `src/lib/api.ts` with service-aware helpers rather than hard-coding auth-service behavior into all requests:
  - keep existing auth-service JSON helper behavior for current auth flows;
  - add a labs-reviewer JSON helper for `/me`, process status, agent detail, and output lists;
  - add a labs-reviewer multipart helper for `/labs/review`.
- Labs-reviewer requests should include:
  - `Authorization: Bearer <token>`;
  - `accept-language`.
- Labs-reviewer requests should not include auth-service-only `x-api-key` or `x-application-id`.
- Error parsing should support both current auth-service `{ error }` and FastAPI `{ detail }` response bodies.

### Auth And Local Storage

- Add `AuthenticatedUserResponse` in `src/features/auth/types.ts`.
- Add `getMe(token: string)` in `src/features/auth/api.ts` or a clearly named auth API module that still belongs to the auth feature.
- Add `src/features/auth/userStorage.ts`:

```ts
const AUTHENTICATED_USER_STORAGE_KEY = 'labs-login.authenticated-user'

saveAuthenticatedUser(user: AuthenticatedUserResponse): void
getStoredAuthenticatedUser(): AuthenticatedUserResponse | null
clearStoredAuthenticatedUser(): void
```

- Update `ProtectedRoute` so a session token is validated through labs-reviewer `GET /me` before rendering `/home`.
- On successful `/me`, store the returned user and render the protected route.
- On `/me` failure with 401/403, clear the session token and stored user, then redirect to `/sign-in`.
- On logout from `HomePage`, clear both session token and stored user.

### Routing And Query Parameters

- After successful upload, navigate to:

```text
/review-result?process_id=<process_id>
```

- Keep the query key as `process_id` to match the backend response field.
- The dashboard may also keep the active process id in local component state while navigation occurs, but the URL query parameter is the persistence mechanism for refresh/share behavior.
- The initial `ReviewResultPage` should not implement final result rendering yet. It only needs protected routing, query parsing, basic empty/missing states, and page copy.

### Dashboard UX

`/home` should become a work-focused dashboard with these areas:

- Header:
  - product/context label;
  - stored user email when available;
  - logout button.
- Upload panel:
  - `.md` file input;
  - selected file name;
  - inline validation for missing or invalid file;
  - primary upload button with disabled and loading states.
- Active process panel:
  - current `process_id`;
  - top-level process status from `ProcessStatusResponse.status`;
  - uploaded file name from process status when available;
  - created timestamp;
  - polling/loading indicator;
  - nested agent status tree.
- Agent detail panel:
  - opened from a status tree item;
  - fetches `GET /labs/agent-process/{id}`;
  - shows status metadata and result content.
- Outputs panel:
  - Markdown output list;
  - PDF output list;
  - refresh button with disabled/loading state;
  - empty states for each list.

### Process Status UI Rules

- Render each agent status as a compact row with:
  - agent name;
  - status label;
  - loop metadata when present, for example `1/3`;
  - finished timestamp when present;
  - details action.
- Render nested child agent processes indented under their parent.
- Use clear state styling:
  - `IN_PROGRESS`: active/pending;
  - `SUCCEEDED`: success;
  - `FAILED`: error.
- Do not expose `result` in the tree; only the detail endpoint can load it.
- If `data` is empty immediately after upload, show a "waiting for agents to start" state and keep polling.
- Render the process-level status separately from agent-level rows. `ProcessStatusResponse.status` is the authoritative process state.

### Error Handling

- Client-side invalid file extension: inline localized validation, no network request.
- Backend 400 `{ detail }`: show the detail text when it is a string, for example "Only .md files are supported."
- 401/403 from labs-reviewer: clear session and stored user, redirect to `/sign-in`.
- 404 for process or agent-process detail: show localized not-found feedback and keep the dashboard usable.
- Network/5xx/configuration failures: show localized fallback copy with Sonner and persistent inline state where relevant.

### Styling

- Extend existing token-based CSS in `src/App.css`.
- Use a responsive dashboard layout:
  - single column on mobile;
  - two-column or main/side layout on desktop.
- Keep controls dense and operational; this is an authenticated tool, not a landing page.
- Use existing `LoadingIcon` for all async buttons.
- Do not nest cards inside cards. Use page sections/panels and compact repeated rows.
- Preserve accessibility:
  - visible labels for file input and controls;
  - keyboard access for detail actions;
  - meaningful focus states;
  - status text not conveyed by color alone.

## Milestones

1. Add labs-reviewer config and HTTP helpers in `src/lib/config.ts` and `src/lib/api.ts`.
2. Add `/me` auth integration, `AuthenticatedUserResponse`, and localStorage helpers under `src/features/auth`.
3. Update `ProtectedRoute` and logout cleanup to use `/me` and clear stored user data.
4. Create `src/features/labs-reviewer/types.ts` and `src/features/labs-reviewer/api.ts` for upload, status, agent detail, and outputs.
5. Build `useLabsReviewerDashboard` to coordinate file selection, upload, output refresh, and navigation to the result route.
6. Build upload, status tree, agent detail, and outputs components under `src/features/labs-reviewer/components`.
7. Replace `/home` placeholder with the Labs Reviewer dashboard composition.
8. Add the initial protected `ReviewResultPage` shell and wire `/review-result?process_id=<process_id>`.
9. Add English and Portuguese i18n copy plus dashboard/result-page CSS.
10. Use the `labs-automated-tests` subagent when implementing code, then update Cypress coverage for new and changed behavior.
11. Validate with `npm run lint`, `npm run build`, and `npm run test:e2e`.

## Edge Cases

- No session token exists: redirect to `/sign-in` without calling `/me`.
- `/me` succeeds but localStorage is unavailable: continue rendering authenticated UI and skip persistence without crashing.
- `/me` returns an invalid user id shape: treat as auth/backend failure and clear session.
- Upload succeeds but process polling returns 404 briefly: show a retrying state for a short grace period, then surface not-found feedback if it persists.
- Process status `data` is empty while background work starts: show waiting state and continue polling.
- Process status response includes top-level `status` that disagrees with child-agent statuses: display the top-level process state as authoritative and keep child statuses visible for diagnosis.
- Result page is opened without `process_id`: show a localized empty state and a navigation action back to `/home`.
- An agent fails while other agents succeed: keep rendering the tree and allow opening details for failed/succeeded records.
- Agent detail `result` is very large: show it in a scrollable panel and avoid placing it inside the status tree.
- Output lists are empty: show separate Markdown/PDF empty states.
- Output links fail because static paths are not served: keep the returned filename/path visible and report this as backend/static serving risk.
- CORS blocks local frontend origin: run the frontend on a backend-allowed port or handle CORS in a separate backend change.

## Acceptance Criteria

- [ ] `src/features/labs-reviewer` exists with typed API, types, hook, and components.
- [ ] `VITE_LABS_REVIEWER_API_BASE_URL` is required for labs-reviewer requests.
- [ ] Existing auth-service sign-in/sign-up calls still use existing auth-service config and headers.
- [ ] Protected `/home` calls labs-reviewer `GET /me` with bearer token before rendering.
- [ ] Successful `/me` responses are stored under `labs-login.authenticated-user`.
- [ ] Logout and invalid auth clear both the session cookie and stored authenticated-user data.
- [ ] `/home` lets an authenticated user select and upload a `.md` file.
- [ ] Upload sends multipart `file` data to `POST /labs/review` without manually setting multipart `Content-Type`.
- [ ] Upload pending state disables the button and renders `LoadingIcon`.
- [ ] Successful upload shows backend `message`, captures `process_id`, refreshes outputs, and navigates to `/review-result?process_id=<process_id>`.
- [ ] Successful upload navigates to `/review-result?process_id=<process_id>`.
- [ ] `/review-result` is protected and reads `process_id` from the query string.
- [ ] `/review-result` can render an initial empty shell when `process_id` exists.
- [ ] `/review-result` handles missing `process_id` with a localized empty state and a link back to `/home`.
- [ ] Process polling calls `GET /labs/processes/{process_id}/status`.
- [ ] The dashboard uses `ProcessStatusResponse.status` as the authoritative process state.
- [ ] The status tree renders nested agent-process records and never expects `result` from the process endpoint.
- [ ] Agent detail fetch calls `GET /labs/agent-process/{agent_process_id}` and displays `result`.
- [ ] Markdown outputs load from `GET /outputs/makdown`.
- [ ] PDF outputs load from `GET /outputs/pdf`.
- [ ] Output links are built from labs-reviewer base URL plus returned `path`.
- [ ] Output links open in a new tab.
- [ ] New dashboard copy exists in English and Portuguese.
- [ ] Cypress tests cover `/me` storage/cleanup, upload success, process polling, agent detail result, output lists, and critical error states.
- [ ] `npm run lint`, `npm run build`, and `npm run test:e2e` pass after implementation.

## Test Plan

- Unit: None. ADR 0010 keeps frontend behavior coverage in Cypress for this project.
- Cypress:
  - update protected-route tests to use `GET /me`, assert bearer token header, assert localStorage write, and assert cleanup on 401/403;
  - add dashboard tests for `.md` file upload success and `process_id` capture;
  - assert successful upload navigates to `/review-result?process_id=<process_id>`;
  - test `/review-result` protected routing, query parsing, existing `process_id` shell state, and missing `process_id` empty state;
  - assert upload uses multipart form data and does not include auth-service-only headers;
  - test invalid file extension validation without a network call;
  - test process status polling with top-level `status: IN_PROGRESS`, `status: SUCCEEDED`, and `status: FAILED`;
  - test nested agent rows and loop metadata rendering;
  - test opening agent detail and rendering `result`;
  - test process/agent 404, backend 400 detail, network failure, and 5xx fallback behavior;
  - test Markdown/PDF output empty and populated states;
  - run practical accessibility checks with the existing Cypress axe helper.
- Manual verification:
  - start labs-reviewer with MongoDB reachable;
  - sign in through the frontend with a token accepted by labs-reviewer;
  - confirm `/home` stores the `/me` payload in `localStorage`;
  - upload a UTF-8 `.md` file and confirm a `process_id` appears;
  - watch process status progress through writer, code examples, reviewer, metadata, and translator records;
  - open at least one agent detail and confirm `result` is visible;
  - confirm Markdown and PDF outputs appear after processing;
  - verify logout clears both cookie and localStorage.
- Commands:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`

## Risks And Mitigations

- Risk: The frontend now talks to two backend services with different header requirements.
  - Mitigation: keep service-aware API helpers and never put direct `fetch` calls in components.
- Risk: Labs-reviewer CORS does not include Vite's default e2e port.
  - Mitigation: run local verification on a backend-allowed port or handle CORS separately in the backend.
- Risk: `/outputs/makdown` is misspelled.
  - Mitigation: call the implemented route exactly and isolate the spelling in `src/features/labs-reviewer/api.ts`.
- Risk: Agent `result` can be large.
  - Mitigation: load results on demand through the detail endpoint and render in a scrollable panel.
- Risk: Output list paths may not be served as static files in some backend environments.
  - Mitigation: build links from the returned contract and verify static serving manually.
- Risk: LocalStorage profile data can become stale.
  - Mitigation: refresh it on protected-route entry and clear it whenever session state is cleared.

## Open Questions

- None for this implementation step.
