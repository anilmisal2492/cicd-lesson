# ChatService Contract

## Purpose

Define the model boundary used by the CA Buddy application. The UI depends on
this contract and does not depend directly on a provider SDK. The contract is
implemented once for Google Gemini through LangChain.js and once by a deterministic
fake for unit tests.

## Request

```text
sendMessage(
  question: string,
  history: ChatMessage[]
) -> Promise<ChatResult>
```

The caller must trim and validate `question` before invoking the service. `history`
contains completed turns in chronological order and is empty for a new chat.

## Result

```text
ChatResult {
  content: string,
  kind: "answer" | "ca-referral"
}
```

`content` is non-empty plain-language text. `ca-referral` is used when the answer
must direct the user to consult a Chartered Accountant.

## Failure behavior

The service rejects with a typed or normalized error category that the UI maps to
a safe recovery message:

- `missing-api-key`: configuration is unavailable;
- `provider-failure`: the model call failed or was unavailable;
- `invalid-response`: the provider did not return usable text.

Raw API keys, request headers, provider payloads, and stack traces are never part
of the user-visible error.

## Production adapter obligations

- Use Google Gemini through `@langchain/google-genai`.
- Use model `gemini-3.6-flash` with maximum output tokens `1024`.
- Load the CA system prompt from `src/prompts/ca-persona.ts`.
- Read the key from `VITE_GOOGLE_API_KEY`.
- Send the ordered history so follow-up context is preserved.

## Test adapter obligations

- Return deterministic results without network access.
- Record received question and history so tests can assert conversation memory.
- Support deterministic success, CA-referral, and failure cases.

## Browser interception contract

Playwright tests intercept the outbound Gemini request and return a fixed response
or failure. They must assert that the page renders the expected user-visible
state and must never require a live Gemini key or live provider response.
