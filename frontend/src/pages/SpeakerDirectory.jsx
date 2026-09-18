import { useState } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import TrackBadge from '../components/speaker/TrackBadge.jsx'
import { speakers } from '../mocks/speakers.js'
import { tracks } from '../mocks/tracks.js'
import { proposals } from '../mocks/proposals.js'
import { panels } from '../mocks/panels.js'
import './speaker/SpeakerDashboard.css'
import './SpeakerDirectory.css'

export default function SpeakerDirectory() {
  const [trackId, setTrackId] = useState('all')
  const [query, setQuery] = useState('')
  const visibleSpeakers = speakers.filter(speaker =>
    (trackId === 'all' || speaker.trackIds.includes(trackId)) &&
    speaker.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))

  function clearFilters() {
    setTrackId('all')
    setQuery('')
  }

  return <>
    <a className="skip-link" href="#directory-main">Skip to content</a>
    <Header />
    <main id="directory-main" className="container section speaker-directory" tabIndex={-1}>
      <p className="eyebrow">Explore STEAM</p>
      <h1>Proposed speakers</h1>
      <p className="portal-demo">Proposed placeholder programming for UI development only. No named person is confirmed or has agreed to attend. These concepts do not imply endorsement, partnership, or affiliation with STEAM Con. Session titles and panel groupings are UI concepts, not submissions or claims by these people.</p>
      <section aria-labelledby="directory-heading">
        <h2 id="directory-heading">Speaker directory</h2>
        <fieldset className="portal-filters">
          <legend>Filter speakers by primary or additional track</legend>
          {[{ id: 'all', name: 'All' }, ...tracks].map(track =>
            <button key={track.id} type="button" aria-pressed={trackId === track.id} onClick={() => setTrackId(track.id)}>{track.name}</button>)}
        </fieldset>
        <label className="directory-search">Search speakers by name
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} />
        </label>
        <p className="portal-result-count" role="status">{visibleSpeakers.length} proposed {visibleSpeakers.length === 1 ? 'speaker' : 'speakers'}</p>
        {visibleSpeakers.length ? <ul className="directory-grid">
          {visibleSpeakers.map(speaker => <li key={speaker.id}>
            <article className="directory-card" aria-labelledby={speaker.id}>
              <h3 id={speaker.id}>{speaker.name}</h3>
              <details><summary>Biography</summary><p>{speaker.bio}</p></details>
              {speaker.organization && speaker.role && <p className="portal-muted">{speaker.role}, {speaker.organization}</p>}
              <dl className="directory-tracks">
                <div><dt>Primary track</dt><dd><TrackBadge trackId={speaker.trackIds[0]} /></dd></div>
                {speaker.trackIds.length > 1 && <div><dt>Additional tracks</dt><dd>{speaker.trackIds.slice(1).map(id => <TrackBadge key={id} trackId={id} />)}</dd></div>}
              </dl>
              <h4>Proposed sessions and panels</h4>
              <ul>{proposals.filter(proposal => proposal.speakerIds.includes(speaker.id)).map(proposal =>
                <li key={proposal.id}>{proposal.title} <span className="portal-muted">({proposal.format})</span></li>)}</ul>
            </article>
          </li>)}
        </ul> : <div className="portal-empty">
          <h3>No speakers match these filters</h3>
          <p>Try another name or clear the filters to explore all 15 proposed speakers.</p>
          <button className="button button-paper" type="button" onClick={clearFilters}>Show all speakers</button>
        </div>}
      </section>
      <details className="directory-panels"><summary id="panels-heading">Proposed crossover panels</summary>
        <p>All five placeholder panel concepts, independent of the speaker filters.</p>
        <ul className="directory-grid">
          {panels.map(panel => <li key={panel.id}>
            <article className="directory-card" aria-labelledby={panel.id}>
              <h3 id={panel.id}>{panel.title}</h3>
              <div className="directory-panel-tracks">{panel.trackIds.map(id => <TrackBadge key={id} trackId={id} />)}</div>
              <p>Proposed placeholder participants:</p>
              <ul>{panel.speakerIds.map(id => <li key={id}>{speakers.find(speaker => speaker.id === id)?.name}</li>)}</ul>
            </article>
          </li>)}
        </ul>
      </details>
    </main>
    <Footer />
  </>
}
