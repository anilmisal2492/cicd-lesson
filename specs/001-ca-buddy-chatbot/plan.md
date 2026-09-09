# Implementation Plan: CA Buddy Chatbot

**Branch**: `001-ca-buddy-chatbot` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-ca-buddy-chatbot/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

CA Buddy is a single-screen chatbot for Indian small-business owners seeking
general information about GST, TDS, ITR deadlines, and audit basics. The plan
uses a small React and TypeScript frontend, an explicit `ChatService` boundary,
ephemeral conversation state, a dedicated CA persona prompt, deterministic unit
and browser tests, and a GitHub Pages workflow gated by all required tests.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure presented in advisory capacity to guide the
  iteration process.
-->

**Language/Version**: TypeScript with the current Vite-supported Node.js LTS
toolchain

**Primary Dependencies**: React, Vite, `@langchain/google-genai`, Vitest,
Testing Library, and Playwright

**Storage**: N/A; conversation state is in browser memory for the current chat

**Testing**: Vitest and Testing Library with a fake model; Playwright with the
Gemini request intercepted

**Target Platform**: Modern desktop and mobile browsers served as a static
GitHub Pages site

**Project Type**: Single-page frontend web application

**Performance Goals**: Show progress immediately after submission, preserve the
conversation while waiting, and support the primary user journey in under three
minutes; no provider latency SLA is introduced

**Constraints**: No backend, server, database, login, saved history, settings,
or persistent profile. Direct browser-to-Gemini access uses
`VITE_GOOGLE_API_KEY`; the key must not be committed, rendered, or logged. No
live Gemini calls are allowed in CI tests. Deployment must wait for all required
tests.

**Scale/Scope**: One screen, one current-chat conversation per browser session,
four supported topic areas, and exactly five ordered delivery tasks with one
issue and one pull request per task

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Frontend-Only Boundary**: PASS. The design contains only a React/Vite
  frontend, direct browser-to-Gemini access, and no backend, server, or database.
- **II. Explicit Service Contract**: PASS. `ChatService` is the model boundary;
  production uses Gemini through LangChain.js and tests use a fake implementation.
- **III. Safety Before Certainty**: PASS. The dedicated CA persona prompt defines
  scope, referral rules, and the visible general-information disclaimer.
- **IV. Deterministic Verification**: PASS. Unit tests fake the model and
  Playwright intercepts Gemini requests; the quickstart covers required states.
- **V. Small, Reviewable Delivery**: PASS. The structure supports exactly five
  ordered tasks, one issue and PR each, CI on pushes/PRs, and gated Pages deploy.

**Pre-Phase 0 Gate**: PASS. No constitution violation or unresolved technical
clarification remains after research.

## Project Structure

### Documentation (this feature)

```text
specs/001-ca-buddy-chatbot/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── App.tsx
├── main.tsx
├── components/
│   ├── ChatPanel.tsx
│   ├── MessageList.tsx
│   └── Disclaimer.tsx
├── prompts/
│   └── ca-persona.ts
├── services/
│   ├── chat-service.ts
│   ├── fake-chat-service.ts
│   └── gemini-chat-service.ts
└── styles/
    └── app.css

tests/
└── unit/
e2e/
├── chat.spec.ts
└── fixtures/
    └── gemini-response.json

.github/workflows/
├── ci.yml
└── deploy-pages.yml

playwright.config.ts
vitest.config.ts
vite.config.ts
```

**Structure Decision**: Use one root Vite project. UI components remain separate
from model services and the persona prompt; unit tests live under `tests/unit`,
browser journeys under `e2e`, and CI/deployment workflows under
`.github/workflows`. No backend or persistence directory exists.

## Phase 1 Design Notes

- `ChatService` receives the current ordered conversation plus the new question
  and returns an assistant message or a user-safe error result.
- Conversation state is owned by the application layer and passed into the
  service; “New chat” replaces it with an empty conversation.
- The production adapter supplies the system prompt and model configuration
  (`gemini-3.6-flash`, maximum output `1024`) to LangChain.js.
- The CI workflow runs unit tests and the intercepted Playwright suite on pushes
  and pull requests. The Pages workflow depends on the passing test job before
  building or publishing.

**Post-Phase 1 Constitution Gate**: PASS. The design preserves all five
principles, contains no extra task or backend, and keeps test and deployment
  gates explicit.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
