export const steamCategories = [
  { code: 'S', slug: 'science', name: 'Science' },
  { code: 'T', slug: 'technology', name: 'Technology' },
  { code: 'E', slug: 'engineering', name: 'Engineering' },
  { code: 'A', slug: 'art', name: 'Art' },
  { code: 'M', slug: 'mathematics', name: 'Mathematics' },
]

export function trackCategoryCode(trackName) {
  const slug = (trackName || '').trim().toLowerCase()
  return steamCategories.find(category => category.slug === slug)?.code ?? null
}

export function trackCategorySlug(trackName) {
  const slug = (trackName || '').trim().toLowerCase()
  return steamCategories.some(category => category.slug === slug) ? slug : 'neutral'
}

export function allCategoryCodes() {
  return new Set(steamCategories.map(category => category.code))
}
