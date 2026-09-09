import { describe, expect, it } from 'vitest'
import { CA_PERSONA_PROMPT, isCAReferral } from '../../src/prompts/ca-persona'

describe('CA Buddy persona', () => {
  it('restricts general answers to the supported everyday tax topics', () => {
    expect(CA_PERSONA_PROMPT).toContain('GST, TDS, ITR deadlines, and audit basics')
    expect(CA_PERSONA_PROMPT).toContain('plain language')
  })

  it('refers personal and filing-specific matters to a Chartered Accountant', () => {
    expect(CA_PERSONA_PROMPT).toContain('consult a Chartered Accountant')
    expect(isCAReferral('Please consult a Chartered Accountant for filing-specific advice.')).toBe(true)
    expect(isCAReferral('Here is a general explanation of an ITR deadline.')).toBe(false)
  })
})
