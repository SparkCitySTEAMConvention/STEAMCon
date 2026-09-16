export async function submitRegistration(payload, { signal } = {}) {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 650)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Request aborted', 'AbortError'))
    }, { once: true })
  })

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('You appear to be offline. Check your connection and try again.')
  }

  return { id: `preview-${Date.now()}`, ...payload }
}

