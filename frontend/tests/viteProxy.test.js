import test from 'node:test'
import assert from 'node:assert/strict'
import process from 'node:process'
import { build } from 'vite'
import config from '../vite.config.js'

test('development-only API proxy preserves default, override and React plugin', () => {
  const previous = process.env.VITE_API_PROXY_TARGET
  try {
    // Empty process override also shields this assertion from local .env files.
    process.env.VITE_API_PROXY_TARGET = ''
    const dev = config({ command: 'serve', mode: 'development', isPreview: false })
    assert.deepEqual(Object.keys(dev.server.proxy), ['/api'])
    assert.equal(dev.server.proxy['/api'].target, 'http://localhost:8080')
    assert.equal(dev.server.proxy['/api'].rewrite, undefined)
    assert.ok(dev.plugins.length)
    process.env.VITE_API_PROXY_TARGET = 'http://localhost:9090'
    assert.equal(config({ command: 'serve', mode: 'development' }).server.proxy['/api'].target, 'http://localhost:9090')
    assert.equal(config({ command: 'build', mode: 'production' }).server.proxy, undefined)
    assert.equal(config({ command: 'serve', mode: 'production', isPreview: true }).server.proxy, undefined)
  } finally {
    if (previous === undefined) delete process.env.VITE_API_PROXY_TARGET
    else process.env.VITE_API_PROXY_TARGET = previous
  }
})

test('production browser output excludes default and overridden backend targets', async () => {
  const previous = process.env.VITE_API_PROXY_TARGET
  try {
    process.env.VITE_API_PROXY_TARGET = 'http://localhost:9090'
    const result = await build({ logLevel: 'silent', build: { write: false } })
    const outputs = (Array.isArray(result) ? result : [result]).flatMap(bundle => bundle.output)
    assert.ok(outputs.some(output => output.type === 'chunk'))
    for (const output of outputs) {
      const text = output.type === 'chunk' ? output.code : String(output.source)
      assert.doesNotMatch(text, /http:\/\/localhost:(?:8080|9090)/, output.fileName)
    }
  } finally {
    if (previous === undefined) delete process.env.VITE_API_PROXY_TARGET
    else process.env.VITE_API_PROXY_TARGET = previous
  }
})
