import type { ChatMessage } from '../services/chat-service'

type MessageListProps = {
  messages: ChatMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="empty-state" data-testid="empty-state">
        <span className="empty-state__mark">CA</span>
        <p>Ask about GST, TDS, ITR deadlines, or audit basics.</p>
      </div>
    )
  }

  return (
    <div className="message-list" aria-live="polite">
      {messages.map((message, index) => (
        <article
          className={`message message--${message.role}`}
          data-kind={message.role === 'assistant' ? message.kind : undefined}
          key={`${message.role}-${index}`}
        >
          <span className="message__label">{message.role === 'user' ? 'You' : 'CA Buddy'}</span>
          <p>{message.content}</p>
        </article>
      ))}
    </div>
  )
}
