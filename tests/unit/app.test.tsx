import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../../src/App'
import { ChatServiceError, type ChatResult, type ChatService } from '../../src/services/chat-service'

function createService(): ChatService {
  return {
    sendMessage: vi.fn().mockResolvedValue({
      content: 'Input tax credit can reduce the GST you owe when the purchase qualifies.',
      kind: 'answer',
    }),
  }
}

describe('CA Buddy shell', () => {
  it('renders the one-screen chat experience and disclaimer', () => {
    render(<App chatService={createService()} />)

    expect(screen.getByRole('heading', { name: 'CA Buddy' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Your question' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'New chat' })).toBeInTheDocument()
    expect(screen.getByTestId('disclaimer')).toHaveTextContent('General information only')
  })

  it('shows the user question and answer after submission', async () => {
    const user = userEvent.setup()
    const service = createService()
    render(<App chatService={service} />)

    await user.type(screen.getByRole('textbox', { name: 'Your question' }), 'What is GST input tax credit?')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByText('What is GST input tax credit?')).toBeInTheDocument()
    expect(await screen.findByText(/Input tax credit can reduce/)).toBeInTheDocument()
    expect(service.sendMessage).toHaveBeenCalledWith('What is GST input tax credit?', [])
  })

  it('shows progress immediately and preserves the answer after the service resolves', async () => {
    const user = userEvent.setup()
    let resolveResponse: (result: ChatResult) => void = () => undefined
    const service: ChatService = {
      sendMessage: vi.fn(() => new Promise<ChatResult>((resolve) => { resolveResponse = resolve })),
    }
    render(<App chatService={service} />)

    await user.type(screen.getByRole('textbox', { name: 'Your question' }), 'What is TDS?')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(screen.getByTestId('loading-state')).toHaveTextContent('thinking')

    resolveResponse({ content: 'TDS is tax collected at the source of specified payments.', kind: 'answer' })
    expect(await screen.findByText(/TDS is tax collected/)).toBeInTheDocument()
  })

  it('rejects whitespace-only questions before calling the service', async () => {
    const user = userEvent.setup()
    const service = createService()
    render(<App chatService={service} />)

    await user.type(screen.getByRole('textbox', { name: 'Your question' }), '   ')
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
    expect(service.sendMessage).not.toHaveBeenCalled()
  })

  it('maps a missing-key failure to safe recovery text', async () => {
    const user = userEvent.setup()
    const service: ChatService = {
      sendMessage: vi.fn().mockRejectedValue(new ChatServiceError('missing-api-key', 'secret-key-value')),
    }
    render(<App chatService={service} />)

    await user.type(screen.getByRole('textbox', { name: 'Your question' }), 'What is GST?')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByTestId('error-state')).toHaveTextContent('unavailable')
    expect(screen.getByTestId('error-state')).not.toHaveTextContent('secret-key-value')
  })

  it('renders a CA referral and preserves ordered history for a follow-up', async () => {
    const user = userEvent.setup()
    const service: ChatService = {
      sendMessage: vi.fn()
        .mockResolvedValueOnce({ content: 'Please consult a Chartered Accountant for this filing-specific matter.', kind: 'ca-referral' })
        .mockResolvedValueOnce({ content: 'For general GST context, start with the invoice records.', kind: 'answer' }),
    }
    render(<App chatService={service} />)

    const input = screen.getByRole('textbox', { name: 'Your question' })
    await user.type(input, 'Can I file this disputed return?')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByText(/Please consult a Chartered Accountant/)).toBeInTheDocument()
    expect(document.querySelector('[data-kind="ca-referral"]')).toBeInTheDocument()

    await user.type(input, 'What is the general GST context?')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByText(/For general GST context/)).toBeInTheDocument()
    expect(service.sendMessage).toHaveBeenLastCalledWith('What is the general GST context?', [
      { role: 'user', content: 'Can I file this disputed return?' },
      { role: 'assistant', content: 'Please consult a Chartered Accountant for this filing-specific matter.', kind: 'ca-referral' },
    ])
  })

  it('clears all visible context and sends an empty history after New chat', async () => {
    const user = userEvent.setup()
    const service: ChatService = {
      sendMessage: vi.fn()
        .mockResolvedValueOnce({ content: 'A GST answer.', kind: 'answer' })
        .mockResolvedValueOnce({ content: 'A fresh answer.', kind: 'answer' }),
    }
    render(<App chatService={service} />)

    const input = screen.getByRole('textbox', { name: 'Your question' })
    await user.type(input, 'What is GST?')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByText('A GST answer.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'New chat' }))
    expect(screen.queryByText('A GST answer.')).not.toBeInTheDocument()
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()

    await user.type(input, 'What is TDS?')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByText('A fresh answer.')).toBeInTheDocument()
    expect(service.sendMessage).toHaveBeenLastCalledWith('What is TDS?', [])
  })
})
