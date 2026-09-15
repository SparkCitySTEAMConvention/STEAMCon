// Isolated UI test fixture. This date belongs to a fictional test event, never
// STEAM Con. No public figure is associated with this scheduled-state example.
export const scheduledProposal = {
  id: 'proposal-schedule-test', title: 'Fictional schedule test — not STEAM Con programming',
  abstract: 'This isolated fixture exercises an approved proposal with an actual timestamp. Its date and room are synthetic test inputs, not convention details.',
  trackId: 'science', format: 'Talk', durationMinutes: 30, status: 'Approved',
  primarySpeakerId: 'speaker-test', speakerIds: ['speaker-test'],
  speakers: [{ id: 'speaker-test', name: 'Fictional test speaker', firstName: 'Test', bio: 'Synthetic test identity.', organization: null, role: null }],
  adminFeedback: 'Synthetic approval for schedule-action testing only.',
  scheduledAt: '2000-01-01T10:00:00Z', endsAt: '2000-01-01T10:30:00Z', timezone: 'America/New_York', room: 'Synthetic test room', location: null,
}
export function previewRepository(repository, scenario) {
  if (!scenario) return repository
  return {
    ...repository,
    async getDashboard(id) {
      if (scenario === 'loading') return new Promise(() => {})
      if (scenario === 'error') throw new Error('Simulated failure')
      const data = await repository.getDashboard(id)
      return scenario === 'empty' ? { ...data, proposals: [], sessions: [], feedback: [] } : data
    },
    async getProposal(id) {
      if (scenario === 'loading') return new Promise(() => {})
      if (scenario === 'error') throw new Error('Simulated failure')
      if (scenario === 'empty') return null
      if (scenario === 'scheduled') return scheduledProposal
      return repository.getProposal(id)
    },
  }
}
