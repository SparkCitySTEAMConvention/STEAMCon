export default function SpeakerPortrait({ name, initials, tone }) {
  return (
    <div className={`speaker-portrait speaker-portrait-${tone}`}>
      <svg viewBox="0 0 360 420" role="img" aria-label={`Illustrated portrait placeholder for ${name}`}>
        <rect className="portrait-background" width="360" height="420" rx="24" />
        <circle className="portrait-orbit portrait-orbit-one" cx="286" cy="75" r="86" />
        <circle className="portrait-orbit portrait-orbit-two" cx="72" cy="330" r="112" />
        <path className="portrait-spark" d="M54 92h58M83 63v58M284 269h36M302 251v36" />
        <circle className="portrait-head" cx="180" cy="164" r="66" />
        <path className="portrait-body" d="M78 384c10-91 46-141 102-141s92 50 102 141H78Z" />
        <circle className="portrait-detail" cx="157" cy="161" r="7" />
        <circle className="portrait-detail" cx="203" cy="161" r="7" />
        <path className="portrait-detail-line" d="M158 198c13 12 31 12 44 0" />
        <text x="24" y="396">{initials}</text>
      </svg>
    </div>
  )
}
