// Names remain the registration form and checkout values.
export const passes = {
  'All-Access Pass': { slug: 'all-access', price: 249, description: 'All three days, every track, and evening events' },
  'Single-Day Pass': { slug: 'single-day', price: 99, description: 'One convention day and its scheduled sessions' },
  'Student Pass': { slug: 'student', price: 79, description: 'All three days with valid student identification' },
}

export function passBySlug(slug) {
  const entry = Object.entries(passes).find(([, pass]) => pass.slug === slug)
  return entry ? { name: entry[0], ...entry[1] } : undefined
}
