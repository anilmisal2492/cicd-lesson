---

description: "Task list for implementing the CA Buddy chatbot"
---

# Tasks: CA Buddy Chatbot

**Input**: Design documents from `/specs/001-ca-buddy-chatbot/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md),
[research.md](./research.md), [data-model.md](./data-model.md),
[contracts/chat-service.md](./contracts/chat-service.md), and
[quickstart.md](./quickstart.md)

**Tests**: Required by the feature specification and constitution. Unit tests use
the fake model; Playwright tests intercept Gemini requests; both suites run in CI.

**Delivery constraint**: Exactly five ordered tasks. Each task is one GitHub issue
and one pull request. Do not split a task into additional delivery tasks.

## Format: `- [ ] [TaskID] [P?] [Story?] Description`

- **[P]**: Task can run in parallel with another task without depending on
  incomplete work.
- **[Story]**: User story served by a story-phase task.
- Every task below includes concrete repository paths and must remain one ordered
  delivery unit.

## Path Conventions

- Single frontend project: `src/` and `tests/` at repository root
- Browser journeys: `e2e/`
- CI and deployment: `.github/workflows/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the Vite application shell, unit-test foundation, and the
first CI gate. This is delivery Task 1 and the first independently reviewable
increment.

- [X] T001 Create the React + TypeScript + Vite project shell and one-screen CA Buddy UI in `package.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/components/ChatPanel.tsx`, `src/components/MessageList.tsx`, `src/components/Disclaimer.tsx`, `src/styles/app.css`, and `vite.config.ts`; add focused Vitest + Testing Library tests in `tests/unit/app.test.tsx` for FR-001, FR-002, and FR-007, plus the push/pull-request unit-test workflow in `.github/workflows/ci.yml` (Issue/PR 1; no Gemini integration yet).

**Checkpoint**: The static UI renders with the header, chat panel, input, send
action, New chat control, and disclaimer; the unit suite runs in CI.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the service contract, transient conversation types, fake adapter, and production Gemini adapter needed by all story increments. This is delivery Task 2 and must follow T001.

- [X] T002 Define the model boundary and adapters in `src/services/chat-service.ts`, `src/services/fake-chat-service.ts`, and `src/services/gemini-chat-service.ts`; implement the `ChatMessage`, `Conversation`, and `ChatResult` shapes and safe error categories from `data-model.md` and `contracts/chat-service.md`; configure `@langchain/google-genai`, `gemini-3.6-flash`, maximum output `1024`, and `VITE_GOOGLE_API_KEY`; add deterministic contract/unit coverage in `tests/unit/chat-service.test.ts` (Issue/PR 2; no live model calls in tests).

**Checkpoint**: UI code can depend on `ChatService`, tests can inject the fake,
and the production adapter has the required Gemini configuration without adding a
backend or persistence.

---

## Phase 3: User Story 1 - Get an everyday tax answer (Priority: P1) 🎯 MVP

**Goal**: Deliver the core question-and-answer journey for supported GST, TDS,
ITR deadline, and audit-basics questions, with loading, empty-input, and failure
states.

**Independent Test**: With the fake service, submit a supported question and
verify the user message, progress state, and assistant answer; verify empty input,
service failure, unavailable-key handling, and layout preservation.

### Implementation for User Story 1

- [X] T003 [US1] Add the CA persona and connect the complete chat behavior in `src/prompts/ca-persona.ts`, `src/App.tsx`, `src/components/ChatPanel.tsx`, `src/components/MessageList.tsx`, `src/components/Disclaimer.tsx`, and `src/services/gemini-chat-service.ts`; enforce GST/TDS/ITR-deadline/audit-basics scope, the “consult a CA” fallback, visible disclaimer, ordered current-chat memory, New chat reset, loading, empty-input, failure, and unavailable-key states; extend `tests/unit/app.test.tsx`, `tests/unit/ca-persona.test.ts`, and `tests/unit/chat-service.test.ts` for FR-002 through FR-008 (Issue/PR 3; the constitution’s CA-persona task).

**Checkpoint**: A user can complete the primary three-minute demo’s supported
question step, and the unit tests prove deterministic behavior without Gemini.

---

## Phase 4: User Story 2 - Continue a conversation safely (Priority: P2)

**Goal**: Verify the complete browser conversation with intercepted Gemini
requests, including ordered context, New chat reset, CA referral, disclaimer, and
safe failure behavior.

**Independent Test**: Intercept the Gemini request, submit an initial question and
follow-up, select New chat, trigger a CA referral, and verify each expected state
in a real browser without a live model call.

### Implementation for User Story 2

- [X] T004 [US2] Add intercepted browser coverage in `e2e/chat.spec.ts`, `e2e/fixtures/gemini-response.json`, and `playwright.config.ts`; route the Gemini request to deterministic success, CA-referral, and failure fixtures, and verify the supported answer, follow-up context, New chat reset, visible disclaimer, empty-input handling, and safe error states in the full browser journey (Issue/PR 4; the constitution’s Playwright task).

**Checkpoint**: Follow-up context, reset behavior, visible disclaimer, and safety
fallback are independently testable and do not create saved history.

---

## Phase 5: User Story 3 - Know when to consult a CA (Priority: P1)

**Goal**: Publish the tested frontend through GitHub Pages only after all required
checks pass. The CA-referral behavior is already implemented and browser-tested;
this task makes its release gate enforceable.

**Independent Test**: Make a required unit or E2E check fail and confirm Pages
does not publish; make all required checks pass and confirm the static site builds
and publishes successfully.

### Implementation for User Story 3

- [X] T005 [US3] Add GitHub Pages publication in `.github/workflows/deploy-pages.yml`, configure the static base path in `vite.config.ts`, and wire the deployment job to require the passing unit and Playwright jobs from `.github/workflows/ci.yml`; use the GitHub Actions `VITE_GOOGLE_API_KEY` secret only during the production build, publish no backend or persistent data, and validate the complete release walkthrough in `quickstart.md` (Issue/PR 5; the constitution’s Pages-deployment task).

**Checkpoint**: The complete acceptance walkthrough passes in a browser, both test suites run on every push and pull request, and GitHub Pages cannot deploy after a required test failure.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 / T001**: Starts immediately and creates the UI and unit-test base.
- **Phase 2 / T002**: Depends on T001 and blocks story work until the service
  contract and adapters exist.
- **Phase 3 / T003**: Depends on T002 and delivers the MVP supported-topic chat,
  persona, safety fallback, disclaimer, and current-chat behavior.
- **Phase 4 / T004**: Depends on T003 and verifies the browser journey with
  intercepted Gemini requests.
- **Phase 5 / T005**: Depends on T004 and adds the gated GitHub Pages deployment.
- **No parallel delivery tasks**: the constitution requires five ordered tasks,
  one issue and one pull request each, so all five delivery units are sequential.

### User Story Dependencies

- **User Story 1 (P1)**: Begins after T002; it is the suggested MVP and covers the
  core supported-topic answer journey.
- **User Story 2 (P2)**: Implemented in T003 and independently verified in T004
  through ordered history and New chat reset behavior.
- **User Story 3 (P1)**: Safety behavior is implemented in T003, browser-verified
  in T004, and protected at publication by T005.

### Within Each Delivery Task

- Write the focused tests before implementation and confirm they fail for the
  missing behavior when practical.
- Keep the task’s issue and pull request scoped to its listed files and story.
- Run the task’s focused tests before opening its pull request.
- Do not begin the next task until the current pull request and required checks
  pass.

## Parallel Opportunities

Because the five governed delivery tasks are sequential, there are no parallel
issue/PR opportunities. Within a task, the following file-level work can be
prepared concurrently by contributors after the task owner establishes the
interfaces:

- **T001**: UI component files and `tests/unit/app.test.tsx` can be drafted in
  parallel after the Vite shell is initialized.
- **T002**: Contract types and the fake adapter can be drafted in parallel with
  production adapter configuration after the shared result/error shapes are
  agreed.
- **T004**: Persona prompt review and UI reset/disclaimer tests can be drafted in
  parallel after `ChatService` history semantics are fixed.
- **T005**: Pages workflow YAML and Vite base-path configuration can be drafted
  in parallel after the test job names and build output are fixed.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 to establish the one-screen UI and unit-test CI.
2. Complete T002 to establish the fakeable service boundary and Gemini adapter.
3. Complete T003 to deliver the supported-topic question-and-answer journey.
4. Stop and validate User Story 1 independently with the fake service.

### Incremental Delivery

1. Complete T004 to verify memory, New chat, disclaimer, scope rules, and CA
   referral in a browser with Gemini intercepted.
2. Complete T005 to publish through the gated GitHub Pages workflow.
3. Each pull request must pass its focused checks before the next ordered task
   begins.

## Completion Criteria

- Five tasks exist with IDs T001-T005 and no additional delivery tasks.
- Every task has the required checkbox, sequential ID, appropriate story label,
  and concrete file path.
- T001-T005 each map to exactly one GitHub issue and pull request.
- All three user stories have independent test criteria.
- Unit tests use the fake model; Playwright intercepts Gemini requests.
- GitHub Pages deployment is gated on all required tests.
