import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { CA_PERSONA_PROMPT, isCAReferral } from '../prompts/ca-persona'
import {
  ChatServiceError,
  type ChatMessage,
  type ChatResult,
  type ChatService,
} from './chat-service'

export const GEMINI_MODEL = 'gemini-2.5-flash'
export const GEMINI_MAX_OUTPUT_TOKENS = 1024

function extractText(content: unknown): string {
  if (typeof content === 'string') return content.trim()
  if (!Array.isArray(content)) return ''

  return content
    .map((part) => {
      if (typeof part === 'string') return part
      if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') return part.text
      return ''
    })
    .join('')
    .trim()
}

function toProviderMessages(history: ChatMessage[]) {
  return history.map((message) => (
    message.role === 'user' ? new HumanMessage(message.content) : new AIMessage(message.content)
  ))
}

export class GeminiChatService implements ChatService {
  private readonly apiKey: string | undefined

  constructor(apiKey = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined) {
    this.apiKey = apiKey?.trim() || undefined
  }

  async sendMessage(question: string, history: ChatMessage[]): Promise<ChatResult> {
    if (!this.apiKey) {
      throw new ChatServiceError('missing-api-key', 'The Gemini API key is unavailable.')
    }

    try {
      const model = new ChatGoogleGenerativeAI({
        apiKey: this.apiKey,
        model: GEMINI_MODEL,
        maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
        maxRetries: 0,
      })
      const response = await model.invoke([
        new SystemMessage(CA_PERSONA_PROMPT),
        ...toProviderMessages(history),
        new HumanMessage(question),
      ])
      const content = extractText(response.content)
      if (!content) throw new ChatServiceError('invalid-response', 'Gemini returned no usable text.')
      return { content, kind: isCAReferral(content) ? 'ca-referral' : 'answer' }
    } catch (error) {
      if (error instanceof ChatServiceError) throw error
      throw new ChatServiceError('provider-failure', 'Gemini could not answer the question.')
    }
  }
}

export function createDefaultChatService(): ChatService {
  return new GeminiChatService()
}
