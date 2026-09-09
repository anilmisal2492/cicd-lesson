import { expect, test } from '@playwright/test'
import fixtures from './fixtures/gemini-response.json' with { type: 'json' }

test.beforeEach(async ({ page }) => {
  await page.route('**/generativelanguage.googleapis.com/**', async (route) => {
    const requestBody = route.request().postData() ?? ''

    if (/failure/i.test(requestBody)) {
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify(fixtures.failure) })
      return
    }
    if (/disputed|filing-specific/i.test(requestBody)) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixtures.referral) })
      return
    }
    if (/follow-up/i.test(requestBody)) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixtures.followUp) })
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixtures.supported) })
  })
})

test('answers a supported question, preserves follow-up context, and resets cleanly', async ({ page }) => {
  const requests: string[] = []
  await page.route('**/generativelanguage.googleapis.com/**', async (route) => {
    const body = route.request().postData() ?? ''
    requests.push(body)
    const response = /follow-up/i.test(body) ? fixtures.followUp : fixtures.supported
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) })
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'CA Buddy' })).toBeVisible()
  await expect(page.getByTestId('disclaimer')).toContainText('General information only')

  const input = page.getByRole('textbox', { name: 'Your question' })
  await input.fill('What is GST input tax credit?')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByText(/For a general GST question/)).toBeVisible()

  await input.fill('What should I check in this follow-up?')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByText(/For the follow-up/)).toBeVisible()
  expect(requests[1]).toContain('What is GST input tax credit?')

  await page.getByRole('button', { name: 'New chat' }).click()
  await expect(page.getByTestId('empty-state')).toBeVisible()
  await expect(page.getByText(/For a general GST question/)).not.toBeVisible()

  await input.fill('What is TDS?')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByText(/For a general GST question/)).toBeVisible()
  expect(requests[2]).not.toContain('What is GST input tax credit?')
})

test('shows the CA referral, safe provider failure, and empty-input states', async ({ page }) => {
  await page.goto('/')
  const input = page.getByRole('textbox', { name: 'Your question' })
  const send = page.getByRole('button', { name: 'Send' })

  await expect(send).toBeDisabled()
  await input.fill('   ')
  await expect(send).toBeDisabled()
  await input.fill('Can I submit this disputed return?')
  await send.click()
  await expect(page.getByText(/Please consult a Chartered Accountant/)).toBeVisible()

  await input.fill('trigger failure')
  await send.click()
  await expect(page.getByTestId('error-state')).toContainText('could not answer')
  await expect(page.getByTestId('error-state')).not.toContainText('provider unavailable')
})
