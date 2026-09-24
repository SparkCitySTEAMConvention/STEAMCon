import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

test('query-prefilled registration renders the form without checkout, success or API submission', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Prefill must not submit a request') })
  const server = await createServer({ server: { middlewareMode: true, watch: null, ws: false }, appType: 'custom' })
  try {
    const { default: RegistrationPage } = await server.ssrLoadModule('/src/pages/RegistrationPage.jsx')
    for (const query of ['role=attendee&track=science&pass=all-access', 'role=attendee&track=technology&pass=single-day', 'role=attendee&track=art&pass=student', 'role=speaker&track=art&pass=student']) {
      const html = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [`/register?${query}`] }, createElement(RegistrationPage)))
      assert.match(html, /<form[^>]*aria-busy="false"/)
      assert.doesNotMatch(html, /class="registration-checkout"|class="registration-success"|Confirm demo purchase/)
      assert.match(html, /autoComplete="given-name"[^>]*value=""/)
      if (query.includes('role=attendee')) {
        const expected = query.includes('single-day') ? 'Single-Day Pass' : query.includes('student') ? 'Student Pass' : 'All-Access Pass'
        assert.ok(html.includes(`value="${expected}" selected=""`))
      } else assert.match(html, /Start speaker registration/)
    }
    assert.equal(fetch.mock.callCount(), 0)
  } finally {
    await server.close()
  }
})
