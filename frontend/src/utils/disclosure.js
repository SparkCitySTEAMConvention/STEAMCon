// Native details/summary supplies Enter, Space, and Tab behavior.
export function listenForDisclosureDismissal(disclosure, target = document) {
  const closeOutside = event => {
    if (disclosure.open && !disclosure.contains(event.target)) disclosure.open = false
  }
  const closeOnEscape = event => {
    if (event.key === 'Escape' && disclosure.open) {
      disclosure.open = false
      disclosure.querySelector('summary').focus()
    }
  }
  target.addEventListener('pointerdown', closeOutside)
  target.addEventListener('keydown', closeOnEscape)
  return () => {
    target.removeEventListener('pointerdown', closeOutside)
    target.removeEventListener('keydown', closeOnEscape)
  }
}
