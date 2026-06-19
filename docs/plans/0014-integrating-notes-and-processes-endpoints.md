# Plan: Integrating Notes and Processes Endpoints

## Source Spec

Implementation source of truth:

```text
docs/specs/0014-integrating-notes-and-processes-endpoints.md
```

This plan replaces the upload-first Labs Reviewer dashboard with a process-first writing workspace. Users create or select a process, add typed notes and note files, edit notes, submit the process for review, and follow existing agent status results. It also requires one backend addition in `labs-reviewer`: a process-scoped notes endpoint.

## Decisions To Preserve

- `/home` persists selected process state in the URL:

```text
/home?process_id=<process_status_id>
```

- Refreshing `/home?process_id=<id>` restores the selected process and loads its notes.
- Recent processes come from:

```text
GET /labs/processes/
```

- Creating a process uses:

```text
POST /labs/processes/create
```

- The created manual process status is the backend value:

```text
WRITTING
```

- Add this backend endpoint under the existing `/labs/processes` router prefix:

```text
GET /labs/processes/notes/{process_status_id}
```

- The route implementation path in `labs/process_status/router.py` is:

```text
/notes/{process_status_id}
```

- Typed note creation uses:

```text
POST /labs/processes/notes/{process_status_id}
```

- Note editing is in first-version scope and uses:

```text
POST /labs/processes/notes/{process_status_id}?id=<note_id>
```

- File notes use:

```text
POST /labs/processes/files-note/{process_status_id}
```

- Starting review uses:

```text
POST /labs/review/{process_status_id}
```

- After review starts, navigate to:

```text
/review-result?process_id=<process_id>
```

- Poll process status while status is `WRITTING` or `IN_PROGRESS`.
- Stop polling when status is `SUCCEEDED` or `FAILED`.
- Labs Reviewer requests include `Authorization: Bearer <token>` and `accept-language`.
- Labs Reviewer requests do not include auth-service-only `x-api-key` or `x-application-id`.
- Use `LoadingIcon` on pending async buttons.
- Use Cypress for frontend automated coverage; do not add Vitest, Jest, React Testing Library, or frontend unit tests.

## Phase 1: Backend Process-Scoped Notes Endpoint

Repository:

```text
/home/danii/myProjects/labs-reviewer
```

Files:

```text
labs/process_status/router.py
labs/process_status/service.py
labs/process_status/repository.py
tests/test_process_status_router.py
tests/test_process_status_service.py
tests/test_process_status_repository.py
```

Steps:

1. Add `GET /notes/{process_status_id}` to `labs/process_status/router.py` under the existing `/labs/processes` router.
2. Protect the route with `get_current_user`.
3. Parse the authenticated user id with `parse_user_id(user)`.
4. Verify the requested `ProcessStatus` exists and belongs to the authenticated user.
5. Return `404` for missing or non-owned processes.
6. Reuse or add a service method that returns notes for one owned process.
7. Reuse or add a repository method that lists notes by one `process_status_id`.
8. Return `list[ProcessStatusNoteResponse]`.
9. Sort notes by ascending `created_at`, then ascending `updated_at`.
10. Keep the existing all-notes endpoint `GET /labs/processes/notes` unchanged.

Backend tests:

1. Authenticated request returns only notes for the requested process.
2. Notes from other processes owned by the same user are excluded.
3. Notes from another user are excluded through the process ownership check.
4. Missing process returns `404`.
5. Non-owned process returns `404`.
6. Process with no notes returns `200` with `[]`.
7. Unauthenticated request returns `401`.
8. Response ordering is ascending `created_at`, then ascending `updated_at`.

Backend verification:

```bash
PYTHONPATH=. pytest tests/test_process_status_repository.py tests/test_process_status_service.py tests/test_process_status_router.py -q
```

Deliverable:

- The frontend can fetch selected-process notes without loading and filtering all notes.

## Phase 2: Frontend Types And API Helpers

Repository:

```text
/home/danii/myProjects/me-login
```

Files:

```text
src/lib/api.ts
src/features/labs-reviewer/api.ts
src/features/labs-reviewer/types.ts
```

Steps:

1. Update `ProcessStatusState`:

```ts
type ProcessStatusState = 'WRITTING' | 'IN_PROGRESS' | 'FAILED' | 'SUCCEEDED'
```

2. Change `ProcessStatusResponse.file` to `string | null`.
3. Add `WritingProcessStatusResponse`.
4. Add `ProcessStatusNoteResponse`.
5. Add `ProcessStatusNoteBodyRequest`.
6. Rename or replace `ReviewUploadResponse` with a review-start response that still contains:

```text
message
process_id
output_file
```

7. Extend `requestLabsReviewerJson` so it supports authenticated `POST` requests with optional JSON bodies.
8. Keep `requestLabsReviewerForm` for multipart file-note uploads.
9. Add API functions:
   - `listProcessStatuses(token, term?)`
   - `createWritingProcessStatus(token)`
   - `listProcessNotes(token, processStatusId)`
   - `createProcessNote(token, processStatusId, note)`
   - `updateProcessNote(token, processStatusId, noteId, note)`
   - `uploadProcessNoteFile(token, processStatusId, file)`
   - `startProcessReview(token, processStatusId)`
10. Keep existing status/detail/output API functions that are still used by the result page.
11. Remove or stop using `uploadReviewMarkdown` for the primary `/home` flow.
12. Preserve error parsing for FastAPI `{ detail }` and auth-service `{ error }`.

Deliverable:

- Feature code has typed, centralized access to every process/note/review endpoint needed by the new workflow.

## Phase 3: Dashboard State Hook

Files:

```text
src/features/labs-reviewer/hooks/useLabsReviewerDashboard.ts
```

Steps:

1. Replace upload-first state with process-first state:
   - `processes`
   - `selectedProcessId`
   - `notes`
   - composer text
   - active edit note id
   - edit text
   - loading flags for process list, create process, list notes, create note, edit note, file note, and submit review
   - local validation errors
2. Read `process_id` from `/home` search params.
3. On dashboard mount, fetch recent processes.
4. If `process_id` exists in the URL, select it after process list load and fetch its notes.
5. If the URL process id is missing or not visible to the user, show a not-found state while keeping the sidebar usable.
6. On recent-process selection, navigate to `/home?process_id=<id>`.
7. On process creation, refresh or prepend recents, select the new process, and navigate to `/home?process_id=<id>`.
8. Load notes through `GET /labs/processes/notes/{process_status_id}` only.
9. Create typed notes through `POST /labs/processes/notes/{process_status_id}`.
10. Edit notes through `POST /labs/processes/notes/{process_status_id}?id=<note_id>`.
11. Upload file notes through `POST /labs/processes/files-note/{process_status_id}`.
12. Start review through `POST /labs/review/{process_status_id}`.
13. On successful review start, toast the backend `message` and navigate to `/review-result?process_id=<process_id>`.
14. On `401` or `403`, clear session and stored user, then redirect to sign in.
15. Cancel note edit mode when the user switches selected process.

Deliverable:

- Dashboard behavior is centralized in one feature hook, with route state synchronized to `/home?process_id=<id>`.

## Phase 4: Process-First UI Components

Files:

```text
src/features/labs-reviewer/components/ProcessSidebar/ProcessSidebar.tsx
src/features/labs-reviewer/components/ProcessSidebar/ProcessSidebar.types.ts
src/features/labs-reviewer/components/ProcessSidebar/ProcessSidebar.css
src/features/labs-reviewer/components/ProcessWorkspace/ProcessWorkspace.tsx
src/features/labs-reviewer/components/ProcessWorkspace/ProcessWorkspace.types.ts
src/features/labs-reviewer/components/ProcessWorkspace/ProcessWorkspace.css
src/features/labs-reviewer/components/NotesComposer/NotesComposer.tsx
src/features/labs-reviewer/components/NotesComposer/NotesComposer.types.ts
src/features/labs-reviewer/components/NotesComposer/NotesComposer.css
src/pages/HomePage/HomePage.tsx
```

Steps:

1. Replace `ReviewUploadPanel` as the primary dashboard workflow.
2. Build `ProcessSidebar`:
   - identity/title area
   - `New process` action
   - recents list
   - selected process highlight
   - status indicators for `WRITTING`, `IN_PROGRESS`, `FAILED`, `SUCCEEDED`
   - logout access
3. Build `ProcessWorkspace`:
   - empty state when no process is selected
   - not-found state for invalid URL process id
   - selected process header and status
   - notes list
   - editable note state
   - submit review action
4. Build `NotesComposer`:
   - multiline note input
   - attach file icon button
   - send note icon button
   - edit-mode save/cancel controls
   - validation message area
5. Use icons for attach/send/edit actions where available.
6. Use `LoadingIcon` for every pending backend-triggering button.
7. Keep async buttons disabled while their request is pending.
8. Add scoped CSS beside each new component.
9. Avoid adding component-specific styles to `src/App.css`.
10. Make the desktop shell full-height with a fixed-width left sidebar and main workspace.
11. Make mobile layout usable with collapsible or top-drawer sidebar behavior.
12. Ensure composer controls do not overlap notes or page content.

Deliverable:

- `/home` becomes a process-first workspace matching the sidebar and composer direction from the screenshot references.

## Phase 5: Validation And User Feedback

Files:

```text
src/features/labs-reviewer/hooks/useLabsReviewerDashboard.ts
src/lib/i18n/locales/en.json
src/lib/i18n/locales/pt.json
```

Steps:

1. Block empty or whitespace-only typed notes before request.
2. Block empty or whitespace-only edited notes before request.
3. Accept only `.md` and `.txt` file notes, case-insensitive.
4. Block files larger than `10 KiB`.
5. Block empty files when `file.size === 0`.
6. Show localized validation near the composer.
7. Show backend 4xx `{ detail }` or `{ error }` messages in toasts where appropriate.
8. Use localized fallbacks for network, service, auth, and unexpected errors.
9. Add English and Portuguese copy for:
   - recent processes
   - new process
   - selected process empty notes
   - invalid selected process
   - note composer placeholder
   - send note
   - attach file
   - edit note
   - save edit
   - cancel edit
   - submit review
   - `WRITTING` status
   - file validation errors

Deliverable:

- The workflow has clear validation, loading, success, and error states in both supported languages.

## Phase 6: Result Page Compatibility

Files:

```text
src/features/labs-reviewer/components/ReviewResultStatus/ReviewResultStatus.tsx
src/features/labs-reviewer/components/ReviewResultStatus/ReviewResultStatus.types.ts
src/features/labs-reviewer/hooks/useLabsReviewerDashboard.ts
src/pages/ReviewResultPage/ReviewResultPage.tsx
```

Steps:

1. Keep `/review-result?process_id=<id>` as the post-submit status URL.
2. Poll `GET /labs/processes/{process_id}/status`.
3. Continue polling while status is `WRITTING` or `IN_PROGRESS`.
4. Stop polling on `SUCCEEDED` or `FAILED`.
5. Render `WRITTING` as a waiting/draft state.
6. Keep successful agent detail loading through `GET /labs/agent-process/{agent_process_id}`.
7. Ensure `ProcessStatusResponse.file` can render `null` without layout breakage.

Deliverable:

- Existing result inspection keeps working with process-first review submission and the new `WRITTING` state.

## Phase 7: Cypress Coverage

Files:

```text
cypress/e2e/labs-reviewer/dashboard.cy.ts
cypress/support/commands.ts
cypress/support/index.d.ts
```

Steps:

1. Update existing dashboard tests that still expect `POST /labs/review` upload.
2. Add test setup for authenticated `/me`.
3. Stub `GET /labs/processes/`.
4. Stub `GET /labs/processes/notes/{process_status_id}`.
5. Test recents render in the sidebar.
6. Test selecting a process updates the URL to `/home?process_id=<id>`.
7. Test visiting `/home?process_id=<id>` restores selection and loads notes.
8. Test `New process` calls `POST /labs/processes/create`, disables while pending, and selects the returned process.
9. Test typed note creation calls `POST /labs/processes/notes/{process_status_id}` with `{ note }`.
10. Test note editing calls `POST /labs/processes/notes/{process_status_id}?id=<note_id>` with `{ note }`.
11. Test file note upload calls `POST /labs/processes/files-note/{process_status_id}` as multipart form data.
12. Assert multipart upload does not manually set `Content-Type`.
13. Test unsupported file extension validation.
14. Test oversized file validation.
15. Test submit review calls `POST /labs/review/{process_status_id}` and navigates to `/review-result?process_id=<id>`.
16. Test result polling handles `WRITTING`, `IN_PROGRESS`, `FAILED`, and `SUCCEEDED`.
17. Assert Labs Reviewer requests include `Authorization` and `accept-language`.
18. Assert Labs Reviewer requests exclude `x-api-key` and `x-application-id`.
19. Test `401` or `403` clears session and redirects to sign in.

Deliverable:

- Cypress covers the process-first user path and the important backend-boundary contracts.

## Phase 8: Verification

Frontend commands:

```bash
npm run lint
npm run build
npm run test:e2e
```

Backend focused command:

```bash
PYTHONPATH=. pytest tests/test_process_status_repository.py tests/test_process_status_service.py tests/test_process_status_router.py -q
```

Manual verification:

1. Sign in.
2. Open `/home`.
3. Create a process.
4. Confirm the URL becomes `/home?process_id=<id>`.
5. Add two typed notes.
6. Edit one note.
7. Attach one `.md` file.
8. Refresh the browser and confirm the same process and notes load.
9. Submit review.
10. Confirm navigation to `/review-result?process_id=<id>`.
11. Confirm the status page shows agent progress for the same process id.
12. Confirm keyboard navigation works for sidebar, note input, attach, send, edit, submit, and logout.
13. Check desktop and mobile layouts.
14. Check light and dark mode.

Deliverable:

- The complete process-first flow is validated through automated and manual checks.

## Implementation Notes

- Do not keep the old standalone Markdown upload card as the primary workflow.
- Keep output list functionality only if it does not block or complicate the new process-first workflow.
- Keep token/session reads centralized through existing helpers.
- Do not call `fetch` directly from pages or components.
- Keep backend API methods in feature `api.ts` files and shared request mechanics in `src/lib/api.ts`.
- Preserve the misspelled `WRITTING` API value exactly.
- Preserve the misspelled `/outputs/makdown` endpoint if output lists remain visible.
- Use scoped component CSS files for new component styles.
- Do not introduce frontend unit test tooling.

## Rollback Plan

1. Revert `/home` to the previous upload-first dashboard component.
2. Restore primary use of `POST /labs/review` only if the backend still supports it.
3. Remove process-first components and their scoped CSS.
4. Remove process/note API methods that are no longer used.
5. Keep backend `GET /labs/processes/notes/{process_status_id}` if already implemented, because it is additive and does not break existing clients.
6. Revert Cypress tests to the previous upload-first expectations.

## Checklist

- [ ] Add backend `GET /labs/processes/notes/{process_status_id}`.
- [ ] Add backend tests for process-scoped notes.
- [ ] Update Labs Reviewer TypeScript contracts.
- [ ] Extend Labs Reviewer JSON helper for `POST`.
- [ ] Add process and note API methods.
- [ ] Replace upload-first dashboard state with process-first state.
- [ ] Persist selected process in `/home?process_id=<id>`.
- [ ] Restore selected process from URL on refresh.
- [ ] Build recent-process sidebar.
- [ ] Build process workspace.
- [ ] Build note composer.
- [ ] Add typed note creation.
- [ ] Add note editing.
- [ ] Add file note upload.
- [ ] Add review submit from existing process.
- [ ] Update result polling for `WRITTING`.
- [ ] Add English copy.
- [ ] Add Portuguese copy.
- [ ] Update Cypress coverage.
- [ ] Run backend focused tests.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run `npm run test:e2e`.
