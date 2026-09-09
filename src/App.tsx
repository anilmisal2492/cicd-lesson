import { useState } from 'react'
import { ChatPanel } from './components/ChatPanel'
import { Disclaimer } from './components/Disclaimer'
import type { ChatService, Conversation } from './services/chat-service'
import { ChatServiceError } from './services/chat-service'
import { createDefaultChatService } from './services/gemini-chat-service'
import './styles/app.css'

const emptyConversation: Conversation = { messages: [], status: 'idle' }

type AppProps = {
  chatService?: ChatService
}

export default function App({ chatService = createDefaultChatService() }: AppProps) {
  const [conversation, setConversation] = useState<Conversation>(emptyConversation)

  async function submitQuestion(question: string) {
    const userMessage = { role: 'user' as const, content: question }
    const history = conversation.messages
    setConversation({ messages: [...history, userMessage], status: 'loading' })

    try {
      const result = await chatService.sendMessage(question, history)
      setConversation({
        messages: [...history, userMessage, { role: 'assistant', ...result }],
        status: 'idle',
      })
    } catch (error) {
      const message = error instanceof ChatServiceError && error.category === 'missing-api-key'
        ? 'CA Buddy is unavailable until its model key is configured.'
        : 'CA Buddy could not answer right now. Please try again.'
      setConversation({
        messages: [...history, userMessage],
        status: 'error',
        errorMessage: message,
      })
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Everyday tax clarity</p>
          <h1>CA Buddy</h1>
        </div>
        <button className="new-chat" type="button" onClick={() => setConversation(emptyConversation)}>
          New chat
        </button>
      </header>
      <div className="app-intro">
        <p>Practical guidance for the questions that keep small businesses moving.</p>
      </div>
      <ChatPanel
        messages={conversation.messages}
        status={conversation.status}
        errorMessage={conversation.errorMessage}
        onSubmit={submitQuestion}
      />
      <Disclaimer />
    </main>
  )
}
