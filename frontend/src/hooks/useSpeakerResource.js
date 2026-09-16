import { useEffect, useState } from 'react'
export default function useSpeakerResource(loader, resourceKey) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  useEffect(() => {
    let active = true
    Promise.resolve().then(loader).then(data => {
      if (active) setResult({ key: resourceKey, attempt, data, status: 'ready' })
    }, () => {
      if (active) setResult({ key: resourceKey, attempt, status: 'error' })
    })
    return () => { active = false }
  }, [loader, resourceKey, attempt])
  return { ...(result?.key === resourceKey && result.attempt === attempt ? result : { status: 'loading' }), retry: () => setAttempt(value => value + 1) }
}
