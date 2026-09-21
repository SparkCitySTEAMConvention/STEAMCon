import { speakers } from './speakers.js'
import { proposals } from './proposals.js'
import { sessions, convention } from './sessions.js'
export const developmentDisclaimer = 'Development preview: Bill Nye is proposed placeholder programming and is not confirmed as a STEAM Con participant. All named public figures and programming are UI placeholders only. No attendance, endorsement, partnership, or affiliation with STEAM Con is implied.'
export function getSpeakerData(speakerId = 'speaker-bill-nye') {
  const speaker = speakers.find(person => person.id === speakerId)
  return {
    speaker, convention,
    proposals: proposals.filter(proposal => proposal.speakerIds.includes(speakerId)),
    sessions: sessions.filter(session => session.speakerIds.includes(speakerId)).map(session => ({ ...session, speakers: session.speakerIds.map(id => speakers.find(person => person.id === id)) })),
    feedback: proposals.filter(proposal => proposal.speakerIds.includes(speakerId) && proposal.adminFeedback).map(proposal => ({ id: `feedback-${proposal.id}`, title: proposal.title, message: proposal.adminFeedback, date: null, read: false })),
  }
}
export const speakerData = getSpeakerData()
