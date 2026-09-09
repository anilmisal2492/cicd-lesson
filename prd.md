 # CA Buddy PRD

 ## One paragraph
 CA Buddy is a frontend-only chatbot for small-business owners in India that answers everyday questions about GST, TDS, ITR deadlines, and audit basics, while clearly identifying when the user should consult a Chartered Accountant (CA). It is a simple, trustworthy three-minute experience: ask a question, receive a concise answer grounded in the defined scope, and see a CA referral when the matter is personal, high-risk, or requires professional advice.

 ## User
 The primary user is an Indian small-business owner who needs a quick first explanation of a common tax or audit topic, not formal tax advice or a substitute for a CA.

 ## Happy path (this is the three-minute demo)
 The user opens CA Buddy, sees the disclaimer, asks “When is my GST return due?”, receives a plain-language answer, asks a follow-up about TDS, sees the conversation context retained, and then asks a personal or complex question that produces a clear “consult a CA” recommendation. The user can start over with “New chat”.

 ## Out of scope
 No login, saved history, settings, database, backend, tax filing, return calculation, document upload, personalized legal or tax opinion, payment flow, or support for topics outside GST, TDS, ITR deadlines, and audit basics. The product does not replace a Chartered Accountant.

 ## Architecture
 Frontend only. React + TypeScript + Vite. No backend, no server, no database. The browser calls Google Gemini directly through LangChain.js (@langchain/google-genai). The API key is read from VITE_GOOGLE_API_KEY — a local .env during development, a GitHub Actions secret when built in CI.

 Design: modern, attractive and simple. One screen: a header, one chat panel, an input, a "New chat" button, a one-line disclaimer. No login, no saved history, no settings.

 ## Functional requirements FR-1 to FR-8, each testable
 - **FR-1:** The app displays a single screen containing the CA Buddy header, chat panel, message input, send action, “New chat” button, and one-line disclaimer; a UI test verifies each is present.
 - **FR-2:** A user can submit a non-empty question and see their message and the assistant response in the chat panel; a unit test verifies the rendered exchange with a fake model.
 - **FR-3:** The chat preserves prior turns during the current session and sends conversation memory to the model; a unit test verifies a follow-up receives prior messages.
 - **FR-4:** The chatbot answers only GST, TDS, ITR deadlines, and audit basics in concise, plain language; a unit test verifies an in-scope question is answered.
 - **FR-5:** For personal, high-risk, filing-specific, or out-of-scope questions, the chatbot gives a clear “consult a CA” fallback; a unit test verifies the fallback.
 - **FR-6:** The one-line disclaimer is visible on the screen and states that responses are general information, not professional advice; a UI test verifies it.
 - **FR-7:** “New chat” clears the visible conversation and starts a fresh conversation memory; a unit test verifies the reset.
 - **FR-8:** The app handles loading, empty input, model failure, and unavailable API-key states without exposing secrets or breaking the chat layout; unit tests verify these states.

 ## The model (provider, model name, where the system prompt lives, max tokens)
 Provider: Google Gemini through LangChain.js (`@langchain/google-genai`). Model name: `gemini-3.6-flash`. The system prompt lives in `src/prompts/ca-persona.ts`. Maximum output tokens: `1024`.

 ## Quality gates
 Testing: unit tests (Vitest + Testing Library) with the model faked; end-to-end tests (Playwright) with the Gemini request intercepted; both run in GitHub Actions on every push and pull request.

 Deployment: GitHub Pages through GitHub Actions. Tests must pass before anything deploys.

 ## The five tasks
 Exactly five tasks build the whole app, in this order, one GitHub issue and one pull request each:

 1. Chat UI shell, unit tests, and the CI workflow that runs them.
 2. ChatService interface; LangChain + Gemini implementation; a fake implementation for tests.
 3. The CA persona: system prompt in a file, scope rules, "consult a CA" fallback, disclaimer, conversation memory.
 4. Playwright end-to-end tests with the Gemini call intercepted, wired into CI.
 5. GitHub Pages deployment, gated on all tests passing.

 ## Acceptance walkthrough
 On a clean checkout, configure `VITE_GOOGLE_API_KEY` locally, run the app, and complete the three-minute demo: load the one-screen UI, verify the disclaimer, ask an in-scope GST question, ask a contextual TDS follow-up, trigger the “consult a CA” fallback, and reset with “New chat”. Run unit and Playwright tests and confirm they use fakes/interception rather than live model calls. Push a branch and open a pull request; confirm both test suites run in GitHub Actions. Merge only after they pass, then confirm GitHub Pages deploys successfully and the published app still satisfies the walkthrough.
