import { describe, expect, it } from 'vitest'
import { CA_PERSONA_PROMPT, isCAReferral } from '../../src/prompts/ca-persona'
import { ChatServiceError } from '../../src/services/chat-service'
import { FakeChatService } from '../../src/services/fake-chat-service'
import {
  GEMINI_MAX_OUTPUT_TOKENS,
  GEMINI_MODEL,
  GeminiChatService,
} from '../../src/services/gemini-chat-service'

describe('FakeChatService', () => {
  it('records the question and ordered history while returning a deterministic answer', async () => {
    const service = new FakeChatService(() => ({ content: 'Use the GST portal guidance.', kind: 'answer' }))
    const history = [{ role: 'user' as const, content: 'What is GST?' }]

    await expect(service.sendMessage('What is TDS?', history)).resolves.toEqual({
      content: 'Use the GST portal guidance.',
      kind: 'answer',
    })
    expect(service.calls).toEqual([{ question: 'What is TDS?', history }])
  })

  it('supports deterministic referral and failure outcomes', async () => {
    const referral = new FakeChatService(() => ({ content: 'Please consult a Chartered Accountant.', kind: 'ca-referral' }))
    const failure = new FakeChatService(() => new ChatServiceError('provider-failure', 'offline'))

    await expect(referral.sendMessage('Can I file this disputed return?', [])).resolves.toMatchObject({ kind: 'ca-referral' })
    await expect(failure.sendMessage('What is GST?', [])).rejects.toMatchObject({ category: 'provider-failure' })
  })
})

describe('CA persona and Gemini configuration', () => {
  it('defines the supported scope and safety boundary', () => {
    expect(CA_PERSONA_PROMPT).toContain('GST, TDS, ITR deadlines, and audit basics')
    expect(CA_PERSONA_PROMPT).toContain('consult a Chartered Accountant')
    expect(isCAReferral('Please consult a Chartered Accountant for filing-specific advice.')).toBe(true)
    expect(isCAReferral('Here is a general explanation of GST input tax credit.')).toBe(false)
  })

  it('normalizes a missing API key without making a provider call', async () => {
    const service = new GeminiChatService('')

    await expect(service.sendMessage('What is GST?', [])).rejects.toMatchObject({
      category: 'missing-api-key',
    })
    expect(GEMINI_MODEL).toBe('gemini-2.5-flash')
    expect(GEMINI_MAX_OUTPUT_TOKENS).toBe(1024)
  })
})
