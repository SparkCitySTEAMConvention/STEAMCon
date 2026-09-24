import { authenticatedFetch } from './authService.js'

export async function submitRegistration(payload, { signal } = {}) {
  const displayName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim()
  const role = payload.role === 'speaker' ? 'SPEAKER' : 'ATTENDEE'

  const response = await fetch('/api/auth/register', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: payload.email, displayName, password: payload.password, role }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Registration failed (${response.status}).`)
  }

  return response.json()
}

export async function createAdmission(passType) {
  const response = await authenticatedFetch('/api/admission/me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passType }),
  })
  if (!response.ok) throw new Error(`Admission creation failed (${response.status}).`)
  return response.json()
}
