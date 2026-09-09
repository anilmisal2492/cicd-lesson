# CA Buddy Quickstart Validation

## Prerequisites

- Node.js current LTS and npm
- A local Google Gemini API key for interactive development only
- A browser supported by the project test tools

Create a local `.env` containing:

```text
VITE_GOOGLE_API_KEY=your-local-key
```

The key must never be committed. Vite reads this variable when the dev server
starts, so restart `npm run dev` after creating or changing `.env`.

## Install and run

From the repository root:

```bash
npm install
npm run dev
```

Open the local URL and verify the one-screen layout: CA Buddy header, chat panel,
question input, “New chat” button, and visible one-line disclaimer.

## Manual acceptance walkthrough

1. Ask an everyday GST question and verify a concise answer appears after the
   user message.
2. Ask a related TDS follow-up and verify the prior turn remains visible and
   informs the response.
3. Ask a personal, filing-specific, high-risk, or unrelated question and verify
   the response recommends consulting a Chartered Accountant.
4. Select “New chat” and verify all previous messages disappear; submit another
   question and verify the old context is not used.
5. Submit an empty question and verify no empty message is added.
6. Verify loading and provider-failure states preserve completed messages and show
   safe recovery text.

## Automated validation

```bash
npm run test:unit
npm run test:e2e
npm run build
```

The unit suite must use the fake `ChatService`. The Playwright suite must
intercept the Gemini request and must pass without a live model call. The build
must succeed without printing the API key.

## CI and deployment validation

Push a branch or open a pull request and confirm GitHub Actions runs both test
suites. Confirm the Pages deployment job does not run after a failed required
 test and publishes only after all required tests pass. The CI build receives
`VITE_GOOGLE_API_KEY` from the configured GitHub Actions secret; tests continue
 to intercept model requests.
