import { FormEvent, useState } from 'react'
import type { ChatMessage, ConversationStatus } from '../services/chat-service'
import { MessageList } from './MessageList'

type ChatPanelProps = {
  messages: ChatMessage[]
  status: ConversationStatus
  errorMessage?: string
  onSubmit: (question: string) => Promise<void>
}

export function ChatPanel({ messages, status, errorMessage, onSubmit }: ChatPanelProps) {
  const [question, setQuestion] = useState('')
  const isLoading = status === 'loading'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || isLoading) return
    setQuestion('')
    await onSubmit(trimmedQuestion)
  }

  return (
    <section className="chat-panel" aria-label="CA Buddy chat">
      <MessageList messages={messages} />
      {isLoading && (
        <p className="status-message" role="status" data-testid="loading-state">
          CA Buddy is thinking...
        </p>
      )}
      {errorMessage && (
        <p className="error-message" role="alert" data-testid="error-state">
          {errorMessage}
        </p>
      )}
      <form className="composer" onSubmit={handleSubmit}>
        <label htmlFor="question">Your question</label>
        <div className="composer__row">
          <input
            id="question"
            name="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="e.g. What is input tax credit?"
            autoComplete="off"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !question.trim()}>
            Send
          </button>
        </div>
      </form>
    </section>
  )
}
