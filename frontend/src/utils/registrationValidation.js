const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRegistration(values, role) {
  const errors = {}
  const required = ['firstName', 'lastName', 'email', 'phone', 'track', 'password']

  if (role === 'speaker') required.push('sessionTitle', 'sessionFormat', 'sessionSummary')

  required.forEach(field => {
    if (!String(values[field] ?? '').trim()) errors[field] = 'This field is required.'
  })

  if (values.email && !emailPattern.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (values.password && values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  return errors
}

