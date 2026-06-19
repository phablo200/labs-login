# Integrating Notes and Processes Endpoints

## Objective
- Replace the current upload-first Labs Reviewer dashboard with a process-first writing workspace.
- Let authenticated users create a manual process, add any number of text notes or `.md`/`.txt` note files, browse recent processes from the backend, and start the existing agent review flow from the selected process.
- Preserve the existing process-status polling and agent-result inspection experience after review starts.

## Background
- The frontend currently submits one `.md` file directly through `POST /labs/review`, then navigates to `/review-result?process_id=<id>`.
- The backend has moved to a process-first flow:
  - `GET /labs/processes/` lists recent user-owned processes and supports optional `term`.
  - `POST /labs/processes/create` creates a manual process with `status="WRITTING"`.
  - `POST /labs/processes/notes/{process_status_id}` creates or updates text notes; an optional `id` query parameter updates an existing note.
  - `POST /labs/processes/files-note/{process_status_id}` stores one uploaded `.md` or `.txt` file as a note.
  - `GET /labs/processes/notes` lists all notes owned by the authenticated user.
  - `GET /labs/processes/notes/{process_status_id}` is required by this spec so the frontend can fetch notes for one selected process without loading every user note.
  - `POST /labs/review/{process_status_id}` starts agent processing from all notes attached to that process.
  - `GET /labs/processes/{process_id}/status` returns the process status and nested agent statuses.
- The older backend specs and plans mention `/labs/process/notes`, `/labs/files-note/{process_status_id}`, and `/labs/processes/notes` without a path id. The implemented `labs/process_status/router.py` is the source of truth for frontend integration in this spec.
- Selected process state must be persisted in the `/home` URL as `?process_id=<id>` so refreshes can restore the active workspace.
- Screenshot references:
  - `/mnt/c/Users/danii/Pictures/Screenshots/labs-reviewer-frontend-example.png`: left sidebar with recent processes.
  - `/mnt/c/Users/danii/Pictures/Screenshots/labs-reviewer-02.png`: create-new-process action in the sidebar.
  - `/mnt/c/Users/danii/Pictures/Screenshots/labs-review-note-or-file.png`: bottom chat composer with a plus/clip affordance.

## Scope
### In Scope
- Add a Labs Reviewer app shell on `/home` with a persistent left sidebar and main process workspace.
- Fetch and render recent processes from `GET /labs/processes/`.
- Add a create-new-process action that calls `POST /labs/processes/create`.
- Select recent processes from the sidebar and load their status and notes.
- Add a backend process-scoped notes endpoint at `GET /labs/processes/notes/{process_status_id}` by adding `/notes/{process_status_id}` to `labs/process_status/router.py`.
- Add a note composer that sends typed notes to `POST /labs/processes/notes/{process_status_id}`.
- Add first-version note editing through `POST /labs/processes/notes/{process_status_id}?id=<note_id>`.
- Add a clip/file action that sends `.md` or `.txt` files to `POST /labs/processes/files-note/{process_status_id}`.
- Allow multiple notes and files per process.
- Add a submit action that calls `POST /labs/review/{process_status_id}` and then navigates to `/review-result?process_id=<process_status_id>`.
- Continue polling `GET /labs/processes/{process_id}/status` while a process is `WRITTING` or `IN_PROGRESS`.
- Keep existing agent detail behavior through `GET /labs/agent-process/{agent_process_id}`.
- Update TypeScript response/request types for `WRITTING`, nullable `file`, note responses, and writing-process responses.
- Add English and Portuguese UI copy for the new shell, recent processes, notes, file validation, create, submit, and empty states.
- Update Cypress coverage for the process-first workflow.

### Out of Scope
- Backend changes in `/home/danii/myProjects/labs-reviewer` except the required process-scoped notes endpoint in `labs/process_status/router.py`, repository, service, and tests.
- Changing the misspelled backend status value `WRITTING`.
- Renaming `/outputs/makdown`.
- Implementing note deletion, drag-and-drop uploads, multi-file upload in one request, or rich text formatting.
- Showing generated Markdown/PDF output lists unless they remain from existing behavior without blocking the new workflow.
- Adding Vitest, Jest, React Testing Library, or unit tests.

## Proposed Approach
### Backend Contracts
- All Labs Reviewer requests use `Authorization: Bearer <token>` and `accept-language`.
- Labs Reviewer requests must not send auth-service-only `x-api-key` or `x-application-id`.
- Parse FastAPI error bodies from `{ detail }` and existing backend error bodies from `{ error }`.

#### `GET /labs/processes/`
Request:

```text
GET /labs/processes/?term=<optional search text>
```

Response:

```ts
type ProcessStatusState = 'WRITTING' | 'IN_PROGRESS' | 'FAILED' | 'SUCCEEDED'

type ProcessStatusResponse = {
  id: string
  file: string | null
  status: ProcessStatusState
  created_at: string
  user_id: string
  data: AgentProcessStatusSummaryResponse[]
}
```

Frontend behavior:
- Load this endpoint when `/home` renders after auth validation.
- Render the returned processes in the sidebar as recents, newest first as returned by the backend.
- Use `file` as the display title when present; otherwise use a localized fallback such as `Untitled process`.
- Highlight the selected process.
- Treat an empty list as a first-run state with a clear create action.
- If search is implemented in the sidebar, pass the text as `term`; otherwise leave search out of the first implementation.

#### `POST /labs/processes/create`
Response:

```ts
type WritingProcessStatusResponse = {
  id: string
  file: string
  status: 'WRITTING'
  created_at: string
  user_id: string
}
```

Frontend behavior:
- Trigger from the sidebar `New process` button.
- Disable the button and show `LoadingIcon` while pending.
- On success, add or refresh the recents list, select the new process, and show the note composer.
- Do not send a request body.

#### `GET /labs/processes/notes`
Response:

```ts
type ProcessStatusNoteResponse = {
  id: string
  process_status_id: string
  description: string
  created_at: string
  updated_at: string
}
```

Frontend behavior:
- Keep this endpoint available for global user-note use cases, but do not use it as the primary selected-process notes source.
- The selected process workspace should use `GET /labs/processes/notes/{process_status_id}` after that endpoint is added.

#### `GET /labs/processes/notes/{process_status_id}`
Backend change:
- Add this route in `labs/process_status/router.py` as `/notes/{process_status_id}` under the existing `/labs/processes` router prefix.
- Protect it with `get_current_user`.
- Verify the requested process exists and belongs to the authenticated user.
- Return `404` for missing or non-owned processes.
- Return notes for only that process, sorted in deterministic creation order: ascending `created_at`, then ascending `updated_at`.
- Reuse `ProcessStatusNoteResponse`.

Response:

```ts
type ProcessStatusNoteResponse = {
  id: string
  process_status_id: string
  description: string
  created_at: string
  updated_at: string
}
```

Frontend behavior:
- Load this endpoint after process list fetch when the URL contains `?process_id=<id>`, after selecting a process, and after adding or editing a text/file note.
- Render each note as a simple message bubble or row in the main workspace.
- Do not client-filter all user notes for the selected-process view.

#### `POST /labs/processes/notes/{process_status_id}`
Request:

```ts
type ProcessStatusNoteBodyRequest = {
  note: string
}
```

Response: `ProcessStatusNoteResponse`.

Frontend behavior:
- Send typed composer content when the user presses Enter or clicks the send control.
- Trim and block empty or whitespace-only notes before making the request.
- Disable the send control and show `LoadingIcon` while pending.
- Clear the composer only after a successful response.
- Append the returned note optimistically only after the backend succeeds, or refresh notes for the selected process.
- Expose note editing in the first UI.
- Each rendered note should have an accessible edit action.
- When editing starts, load the note text into an edit field or the composer in edit mode.
- Save edits through `POST /labs/processes/notes/{process_status_id}?id=<note_id>`.
- Disable the save action and show `LoadingIcon` while pending.
- On successful edit, refresh notes for the selected process or replace the updated note from the response.
- Let users cancel editing without changing the stored note.

#### `POST /labs/processes/files-note/{process_status_id}`
Request:

```text
multipart/form-data
file=<one .md or .txt file>
```

Response: `ProcessStatusNoteResponse`.

Frontend behavior:
- Trigger from a clip/plus icon beside the note composer.
- Accept `.md` and `.txt` files only.
- Validate client-side before upload:
  - unsupported extension: show localized error and do not call the backend;
  - empty file if detectable: show localized error;
  - file larger than `10 KiB`: show localized error.
- Do not set `Content-Type` manually for `FormData`.
- Disable the clip/send area and show pending state while uploading.
- On success, refresh or append notes for the selected process.

#### `POST /labs/review/{process_status_id}`
Response:

```ts
type ReviewStartResponse = {
  message: string
  process_id: string
  output_file: string
}
```

Frontend behavior:
- Trigger from a primary submit action in the active process workspace.
- Require an active process and at least one loaded note before enabling the submit button.
- Disable submit and show `LoadingIcon` while pending.
- On success, show the backend `message`, navigate to `/review-result?process_id=<process_id>`, and start/continue status polling there.
- If the backend returns `400` because the process has no notes, show the backend message in a toast and keep the user in the workspace.

#### `GET /labs/processes/{process_id}/status`
- Continue using the existing result page behavior.
- Poll while `status` is `WRITTING` or `IN_PROGRESS`.
- Stop polling when `status` is `SUCCEEDED` or `FAILED`, on unmount, auth failure, or timeout.
- Render `WRITTING` as a waiting/draft state with no agent rows yet.

### Frontend Architecture
- Keep Labs Reviewer API calls centralized in `src/features/labs-reviewer/api.ts`.
- Update `src/lib/api.ts` so `requestLabsReviewerJson` can support `POST` with JSON bodies, not only `GET`.
- Keep multipart requests in `requestLabsReviewerForm`.
- Keep route strings centralized in `src/routes/routes.enum.ts`.
- Replace `ReviewUploadPanel` with process-first components. Suggested structure:

```text
src/features/labs-reviewer/
├── api.ts
├── types.ts
├── components/
│   ├── ProcessSidebar/
│   │   ├── ProcessSidebar.tsx
│   │   ├── ProcessSidebar.types.ts
│   │   └── ProcessSidebar.css
│   ├── ProcessWorkspace/
│   │   ├── ProcessWorkspace.tsx
│   │   ├── ProcessWorkspace.types.ts
│   │   └── ProcessWorkspace.css
│   ├── NotesComposer/
│   │   ├── NotesComposer.tsx
│   │   ├── NotesComposer.types.ts
│   │   └── NotesComposer.css
│   └── ReviewResultStatus/
│       ├── ReviewResultStatus.tsx
│       ├── ReviewResultStatus.types.ts
│       └── ReviewResultStatus.css
└── hooks/
    └── useLabsReviewerDashboard.ts
```

- Keep route-level composition in `src/pages/HomePage/HomePage.tsx` and `src/pages/ReviewResultPage/ReviewResultPage.tsx`; pages should not call `fetch` directly.
- Use existing `LoadingIcon` for every pending async button.
- Clear session and stored user on `401` or `403`, matching existing protected-route behavior.

### UX And Layout
- `/home` becomes a full-height app shell:
  - fixed-width left sidebar on desktop;
  - collapsible or top-drawer sidebar on mobile;
  - main workspace occupying remaining width;
  - bottom composer anchored within the main workspace.
- Sidebar requirements:
  - show `labs-login` or Labs Reviewer identity at the top;
  - include an icon button or icon-plus-text button for `New process`;
  - list recent processes under a `Recents` heading;
  - show status indicators for `WRITTING`, `IN_PROGRESS`, `FAILED`, and `SUCCEEDED`;
  - keep logout accessible without crowding the recents list.
- Main workspace requirements:
  - no selected process: show a quiet empty state with one create-process action;
  - selected draft process: show notes and the composer;
  - selected running process: show notes plus a clear running status;
  - submitted process: users can follow status on `/review-result`.
- Composer requirements:
  - multiline text input that can tolerate long notes;
  - icon button for file attach;
  - icon button for send note;
  - primary submit button to start review;
  - visible validation and upload errors near the composer.
- Follow `docs/UI_GUIDELINES.md` tokens, dark mode, accessible labels, visible focus states, and scoped CSS ownership.
- Do not keep the old standalone upload card as the primary workflow.

### State Model
- `useLabsReviewerDashboard` should own:
  - `processes`;
  - `selectedProcessId`;
  - `notes`;
  - composer text;
  - active note edit id and edit text;
  - selected/uploading file state;
  - loading flags for list/create/note/file/submit/status;
  - per-area errors.
- URL behavior:
  - `/home` must persist the selected process as `?process_id=<id>`.
  - Selecting a recent process updates the URL to `/home?process_id=<id>`.
  - Refreshing `/home?process_id=<id>` restores that process selection and loads its notes.
  - If the URL process id is not found or not owned by the user, show a not-found state and keep the sidebar usable.
  - `/review-result?process_id=<id>` remains the status/result URL after submit.
- Data refresh rules:
  - fetch process list on dashboard mount;
  - fetch process-scoped notes after process selection, URL restoration, and after adding or editing a note/file;
  - refresh the process list after process creation and review submission;
  - poll process status only when a status view is active.

## Milestones
1. Update contracts and API helpers.
   - Update `ProcessStatusState` to include `WRITTING`.
   - Make `ProcessStatusResponse.file` nullable.
   - Add note, writing-process, process-list, and review-start types.
   - Add API functions for process-scoped note list, create note, edit note, file note, process list, process creation, and review start.
   - Extend Labs Reviewer JSON requests to support `POST` bodies.

2. Add the backend process-scoped notes endpoint.
   - Add `GET /labs/processes/notes/{process_status_id}` in `labs/process_status/router.py` as `/notes/{process_status_id}` under the existing router prefix.
   - Add or reuse repository/service methods that verify process ownership and list notes for one process.
   - Return `list[ProcessStatusNoteResponse]`.
   - Add backend tests for success, unauthenticated access, missing process, non-owned process, empty notes, and deterministic ordering.

3. Build the process-first dashboard shell.
   - Add `ProcessSidebar`, `ProcessWorkspace`, and `NotesComposer`.
   - Replace the `/home` upload card flow with the sidebar/workspace layout.
   - Wire create process and recent-process selection.
   - Persist selected process to `/home?process_id=<id>` and restore it after refresh.
   - Add scoped CSS files for new styled components.

4. Add note, note editing, and file behavior.
   - Send typed notes to `/labs/processes/notes/{process_status_id}`.
   - Edit notes through `/labs/processes/notes/{process_status_id}?id=<note_id>`.
   - Load notes through `/labs/processes/notes/{process_status_id}`.
   - Upload `.md` and `.txt` files to `/labs/processes/files-note/{process_status_id}`.
   - Render notes for the selected process.
   - Handle empty, oversized, unsupported, auth, backend, and network errors.

5. Start review from an existing process.
   - Add submit behavior for `POST /labs/review/{process_status_id}`.
   - Require at least one note before enabling submit.
   - Navigate to `/review-result?process_id=<process_id>` on success.
   - Update result polling to handle `WRITTING`.

6. Update tests and verification.
   - Update Cypress dashboard coverage for the new process-first flow.
   - Add coverage for URL-restored process selection, recent list, create process, text note, note edit, file note, submit review, auth headers, and validation.
   - Run `npm run lint`, `npm run build`, and `npm run test:e2e` when implementation is complete.

## Edge Cases
- No process exists: sidebar shows an empty recents state and the main workspace offers create.
- `GET /labs/processes/` returns a process with `file=null` or an empty file string: use a localized fallback title.
- Active process from `/home?process_id=<id>` is deleted or no longer visible server-side: show a not-found state and refresh recents.
- `GET /labs/processes/notes/{process_status_id}` returns an empty list: show an empty notes state and keep submit disabled.
- User switches processes while a note request is pending: keep the request associated with the process id used at submit time and refresh the currently selected process after completion.
- User starts editing one note, then selects another process: cancel edit mode and load notes for the newly selected process.
- Edited note text is empty after trimming: block save and show localized validation.
- User submits review while status is already `IN_PROGRESS`: backend response should win; frontend should prevent duplicate submits while pending.
- Process has no notes: submit button remains disabled; backend `400` is still handled defensively.
- Uploaded file is `.MD` or `.TXT`: allow it client-side because backend suffix validation is case-insensitive.
- Token expires during dashboard use: clear session and redirect to sign in.
- Mobile sidebar cannot fit all recent processes: make the recents area scroll independently.

## Acceptance Criteria
- [ ] `/home` renders a process-first Labs Reviewer workspace with a left recent-process sidebar on desktop.
- [ ] The sidebar fetches `GET /labs/processes/` with Labs Reviewer auth headers and renders recent processes.
- [ ] The `New process` action calls `POST /labs/processes/create` without a body and selects the returned `WRITTING` process.
- [ ] Selecting a process updates the URL to `/home?process_id=<id>`.
- [ ] Refreshing `/home?process_id=<id>` restores the selected process and loads its notes.
- [ ] Backend exposes `GET /labs/processes/notes/{process_status_id}` and returns only notes for the authenticated user's requested process.
- [ ] Selecting a process loads and displays only that process's notes from `GET /labs/processes/notes/{process_status_id}`.
- [ ] A typed note is saved through `POST /labs/processes/notes/{process_status_id}` and appears in the selected process.
- [ ] A rendered note can be edited through `POST /labs/processes/notes/{process_status_id}?id=<note_id>` and updates in the selected process.
- [ ] The clip/file action uploads `.md` and `.txt` files through `POST /labs/processes/files-note/{process_status_id}`.
- [ ] Unsupported, empty, and oversized files are blocked or reported with localized UI feedback.
- [ ] The submit action is disabled until a process has at least one note.
- [ ] Submit calls `POST /labs/review/{process_status_id}` and navigates to `/review-result?process_id=<process_id>` on success.
- [ ] The result page continues to show agent statuses and agent details for the submitted process.
- [ ] `WRITTING` is displayed as a valid draft/waiting status and does not break polling or status labels.
- [ ] All async buttons disable while pending and render `LoadingIcon`.
- [ ] UI copy is available in English and Portuguese.
- [ ] New component styles are scoped beside their owning components, not added to `src/App.css` except for unavoidable app-shell globals.

## Test Plan
- Backend unit/integration:
  - `GET /labs/processes/notes/{process_status_id}` returns notes only for the requested user-owned process.
  - Missing or non-owned process returns `404`.
  - Unauthenticated request returns `401`.
  - Empty process notes returns `200` with `[]`.
  - Notes are ordered by ascending `created_at`, then ascending `updated_at`.
- Frontend unit: none. ADR 0010 keeps frontend automated coverage in Cypress for this phase.
- Frontend integration/E2E with Cypress:
  - Protected `/home` loads `/me`, then calls `GET /labs/processes/`.
  - Recent processes render in the sidebar and can be selected.
  - Selecting a recent process updates the URL to `/home?process_id=<id>`.
  - Visiting `/home?process_id=<id>` restores selection and loads `/labs/processes/notes/{process_status_id}`.
  - Empty recents state offers `New process`.
  - `New process` posts to `/labs/processes/create`, disables while pending, and selects the returned process.
  - Text note submission posts to `/labs/processes/notes/{process_status_id}` with `{ note }`.
  - Note editing posts to `/labs/processes/notes/{process_status_id}?id=<note_id>` with `{ note }`.
  - File note submission posts multipart data to `/labs/processes/files-note/{process_status_id}` without manually setting `Content-Type`.
  - File validation rejects unsupported extension and oversized file.
  - Submit review posts to `/labs/review/{process_status_id}` and navigates to `/review-result?process_id=<id>`.
  - Result page polls process status and renders `WRITTING`, `IN_PROGRESS`, `FAILED`, and `SUCCEEDED`.
  - Labs Reviewer requests include `Authorization` and `accept-language`, and exclude `x-api-key` and `x-application-id`.
  - `401` or `403` from Labs Reviewer clears session and redirects to sign in.
- Manual verification:
  - Create a process, add two typed notes, edit one note, attach one `.md` file, refresh `/home?process_id=<id>`, submit review, and confirm agent statuses appear for the same process id.
  - Check desktop, tablet, and mobile layouts for sidebar/composer usability.
  - Check keyboard navigation for create, process selection, note input, attach, send, submit, and logout.
  - Check light and dark mode contrast.

## Risks and Mitigations
- Risk: Backend path names differ between older plans and implemented router code.
  - Mitigation: Use `labs/process_status/router.py` and `labs/agents/router.py` implementation as the frontend contract for this spec.
- Risk: The new process-scoped notes endpoint can drift from the existing all-notes endpoint behavior.
  - Mitigation: Reuse the same note response schema and existing ownership checks, and add focused backend tests for the route.
- Risk: `WRITTING` is misspelled but public.
  - Mitigation: Treat it as an exact API value in TypeScript and UI mappings.
- Risk: Anchored composer and sidebar can overlap content on small screens.
  - Mitigation: Use stable layout dimensions, independent scroll regions, and mobile-specific sidebar behavior.
- Risk: Duplicate submits could enqueue multiple reviews for the same process.
  - Mitigation: Disable submit while pending and when the active process is already `IN_PROGRESS`; rely on backend behavior for hard idempotency.

## Open Questions
- None.
