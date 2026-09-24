import { authenticatedFetch } from './authService.js'

async function request(url, options = {}) {
  const response = await authenticatedFetch(url, options)

  if (!response.ok) {
    throw new Error(`Account request failed (${response.status}).`)
  }

  return response.json()
}

export function updateProfileImage(profileImageUrl) {
  return request('/api/auth/me/profile-image', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profileImageUrl,
    }),
  })
}

export const accountRepository = {
  updateProfileImage,
}