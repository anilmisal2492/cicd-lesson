<!--
Sync Impact Report
Version change: unratified -> 1.0.0
Modified principles: scaffold placeholders -> five project principles
Added sections: Project Constraints; Development Workflow
Removed sections: none
Follow-up TODOs: original ratification date is unavailable and remains explicitly marked.
-->

# CA Buddy Constitution

## Core Principles

### I. Frontend-Only Boundary
CA Buddy MUST remain a React, TypeScript, and Vite frontend. It MUST NOT add a
backend, server, database, login system, saved history, or settings surface. The
browser MUST call Google Gemini directly through LangChain.js
(`@langchain/google-genai`). This boundary keeps the product small, auditable, and
aligned with its static GitHub Pages deployment.

### II. Explicit Service Contract
Model access MUST be isolated behind a `ChatService` interface. The production
implementation MUST use LangChain.js with Google Gemini, and tests MUST be able to
replace it with a fake implementation. The API key MUST be read from
`VITE_GOOGLE_API_KEY`; it MUST remain outside source control and MUST NOT be
exposed in rendered UI or test output.

### III. Safety Before Certainty
The CA persona MUST answer only everyday GST, TDS, ITR deadline, and audit-basics
questions in plain language. The system prompt MUST define scope rules and MUST
direct users to consult a Chartered Accountant for personal, high-risk, filing-
specific, or out-of-scope matters. The one-line disclaimer MUST remain visible on
the single screen. The chatbot MUST present general information, not professional
tax or legal advice.

### IV. Deterministic Verification
Every user-visible behavior MUST have an automated verification path. Unit tests
MUST use a fake model, and Playwright end-to-end tests MUST intercept Gemini
requests. Tests MUST cover the chat exchange, conversation memory, reset behavior,
scope fallback, disclaimer, loading, empty input, model failure, and unavailable
API-key states. This prevents live model behavior from making verification
unreliable or costly.

### V. Small, Reviewable Delivery
The complete product MUST be delivered through exactly five ordered tasks. Each
task MUST have one GitHub issue and one pull request. GitHub Actions MUST run the
required tests on every push and pull request, and GitHub Pages deployment MUST be
gated on all tests passing. This keeps changes attributable and prevents an
untested build from being published.

## Project Constraints

The product MUST present one simple screen with a header, one chat panel, an
input, a `New chat` button, and a one-line disclaimer. It MUST support current-
session conversation memory and MUST clear that memory when a new chat starts.
The model configuration is Google Gemini `gemini-3.6-flash` through
`@langchain/google-genai`, with a maximum output of `1024` tokens. The system
prompt MUST live in `src/prompts/ca-persona.ts`. Local development reads the key
from a local `.env`; CI reads it from a GitHub Actions secret.

## Development Workflow

Work MUST proceed in this order: (1) chat UI shell, unit tests, and their CI
workflow; (2) the `ChatService` interface, LangChain plus Gemini implementation,
and fake implementation; (3) the CA persona, scope rules, fallback, disclaimer,
and conversation memory; (4) intercepted Playwright end-to-end tests wired into
CI; and (5) GitHub Pages deployment gated by passing tests. No task may introduce
another task, feature, or backend.

Every pull request MUST identify its task, include focused tests for its behavior,
and pass the applicable GitHub Actions checks before merge. Deployment changes
MUST be reviewed after test gates are in place and MUST publish only from a
passing workflow.

## Governance

This constitution is the governing project standard. A change to it MUST be made
in a reviewed pull request with a stated impact report, rationale, and any
required migration or follow-up work. The change MUST preserve the five-principle
structure unless the impact report explicitly documents a principle addition,
removal, or replacement.

The version follows semantic versioning. A MAJOR increment is required for a
backward-incompatible governance change or principle removal. A MINOR increment is
required for a new principle or materially expanded guidance. A PATCH increment is
required for clarifications, wording corrections, or other non-semantic edits.

Each feature pull request MUST verify compliance with this constitution. Reviewers
MUST reject untested model calls, secret exposure, scope bypasses, backend
introductions, or deployment that can run before required tests pass. The
constitution MUST be reviewed whenever the architecture, delivery workflow, or
user-safety boundary changes.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2026-09-09
