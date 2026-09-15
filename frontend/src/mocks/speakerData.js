// Temporary mock presentation data, not a finalized backend API contract.
// Bill Nye is not confirmed as a STEAM Con participant.
// Proposals, sessions, feedback, dates, times, and rooms are placeholders.
export const speakerData = {
  speaker: { id: 'speaker-jordan', firstName: 'Bill', name: 'Bill Nye', organization: 'The Planetary Society', role: 'Chief Ambassador' },
  proposals: [
    { id: 'proposal-creative-code', title: 'Creative code: making room for unexpected ideas', track: 'Technology', type: 'Workshop', status: 'Draft', schedule: null },
    { id: 'proposal-everyday-science', title: 'Everyday experiments, extraordinary questions', track: 'Science', type: 'Talk', status: 'Pending', schedule: null },
    { id: 'proposal-design-together', title: 'Designing together: from a shared sketch to a working prototype', track: 'Engineering', type: 'Panel', status: 'Approved', schedule: { date: 'Date to be announced', time: 'Time to be announced' } },
  ],
  sessions: [
    { id: 'session-design-together', title: 'Designing together: from a shared sketch to a working prototype', date: 'Date to be announced', time: 'Time to be announced', room: 'Room to be assigned', speakers: [
      { id: 'speaker-jordan', name: 'Bill Nye' },
      { id: 'speaker-riley', name: 'Riley Morgan' },
      { id: 'speaker-alex', name: 'Alex Rivera' },
    ] },
  ],
  feedback: [
    { id: 'feedback-panel', title: 'Your panel is approved', message: 'The panel is ready for the next planning step. Room and schedule details are still to come.', date: 'Date pending', read: false },
    { id: 'feedback-talk', title: 'A little more about your audience', message: 'For your science talk, consider adding the audience’s expected experience level when proposal editing becomes available.', date: 'Date pending', read: true },
  ],
}
