export type ChatRole = 'user' | 'assistant'
export type AssistantMessageKind = 'answer' | 'ca-referral'

export type UserMessage = {
  role: 'user'
  content: string
}

export type AssistantMessage = {
  role: 'assistant'
  content: string
  kind: AssistantMessageKind
}

export type ChatMessage = UserMessage | AssistantMessage

export type ChatResult = {
  content: string
  kind: AssistantMessageKind
}

export type ConversationStatus = 'idle' | 'loading' | 'error'

export type Conversation = {
  messages: ChatMessage[]
  status: ConversationStatus
  errorMessage?: string
}

export type ChatServiceErrorCategory =
  | 'missing-api-key'
  | 'provider-failure'
  | 'invalid-response'

export class ChatServiceError extends Error {
  readonly category: ChatServiceErrorCategory

  constructor(category: ChatServiceErrorCategory, message: string) {
    super(message)
    this.name = 'ChatServiceError'
    this.category = category
  }
}

export interface ChatService {
  sendMessage(question: string, history: ChatMessage[]): Promise<ChatResult>
}
