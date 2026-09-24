import { useRef, useState } from 'react'
import TrackBadge from './TrackBadge.jsx'
import { deleteConfirmedProposal } from '../../services/speakerProposalSource.js'

export default function PreviewProposalList({ source }) {
  // The source owns proposal state; this counter only requests a fresh view.
  const [, refresh] = useState(0)
  const [selected, setSelected] = useState(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const pending = useRef(false)
  const heading = useRef(null)
  const confirmButton = useRef(null)
  const restoreButton = useRef(null)
  const proposals = source.getPreviewProposals()
  async function cancel(proposalId) {
    if (pending.current) return
    await deleteConfirmedProposal(source, proposalId, false)
    restoreButton.current = proposalId
    setSelected(null)
    setError('')
  }
  async function confirm(proposal) {
    if (pending.current) return
    pending.current = true
    setSending(true)
    setError('')
    try {
      await deleteConfirmedProposal(source, proposal.id, true)
      setSelected(null)
      refresh(value => value + 1)
      setNotice(`Deleted “${proposal.title}” from this preview session.`)
      heading.current?.focus()
    } catch (failure) {
      setError(`${failure.message || 'Unable to delete this proposal.'} Your proposal is still here. Please try again.`)
      confirmButton.current?.focus()
    } finally { pending.current = false; setSending(false) }
  }
  return <section className="portal-detail-section" aria-labelledby="local-proposals-heading">
    <h2 id="local-proposals-heading" tabIndex={-1} ref={heading}>Your locally submitted preview proposals</h2>
    <p>Saved for this preview login session. Nothing was sent to the backend.</p>
    <p aria-live="polite">{sending ? 'Deleting preview proposal…' : notice}</p>
    {error && <p role="alert">{error}</p>}
    {proposals.length ? <ul className="portal-list">{proposals.map(proposal => <li key={proposal.id} className="portal-proposal">
      <TrackBadge trackId={proposal.trackId} /><p className="portal-status">{proposal.status}</p><h3>{proposal.title}</h3><p>{proposal.description}</p>
      {selected === proposal.id ? <div role="group" aria-labelledby={`${proposal.id}-confirmation`}>
        <p id={`${proposal.id}-confirmation`}>Delete “{proposal.title}” from this preview session? This cannot be undone.</p>
        <div className="portal-actions">
          <button ref={node => { confirmButton.current = node; if (node && !pending.current) node.focus() }} type="button" className="button button-dark" disabled={sending} onClick={() => confirm(proposal)}>Confirm delete</button>
          <button type="button" className="button button-paper" disabled={sending} onClick={() => cancel(proposal.id)}>Cancel</button>
        </div>
      </div> : source.canDeleteProposal(proposal.id) && <button ref={node => {
        if (node && restoreButton.current === proposal.id) { node.focus(); restoreButton.current = null }
      }} type="button" className="button button-paper" disabled={sending} aria-label={`Delete ${proposal.title}`} onClick={() => { setSelected(proposal.id); setError(''); setNotice('') }}>Delete</button>}
    </li>)}</ul> : <p>No locally submitted preview proposals.</p>}
  </section>
}
