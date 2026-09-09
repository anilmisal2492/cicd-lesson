import type { ChatMessage, ChatResult, ChatService } from './chat-service'

export type ChatCall = {
  question: string
  history: ChatMessage[]
}

export type FakeChatResponder = (question: string, history: ChatMessage[]) => ChatResult | Error

const defaultResponder: FakeChatResponder = (question) => ({
  content: `A practical starting point for "${question}" is to review the relevant records and current rules.`,
  kind: 'answer',
})

export class FakeChatService implements ChatService {
  readonly calls: ChatCall[] = []
  private readonly responder: FakeChatResponder

  constructor(responder: FakeChatResponder = defaultResponder) {
    this.responder = responder
  }

  async sendMessage(question: string, history: ChatMessage[]): Promise<ChatResult> {
    this.calls.push({ question, history: [...history] })
    const response = this.responder(question, history)
    if (response instanceof Error) throw response
    return response
  }
}
