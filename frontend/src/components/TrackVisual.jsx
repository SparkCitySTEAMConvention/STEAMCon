import { trackTreatment } from '../utils/trackFeature.js'
import './TrackVisual.css'

const trackIllustrations = {
  science: 'atom', technology: 'circuit', engineering: 'gears',
  art: 'composition', mathematics: 'geometry', neutral: 'neutral',
}

function ScienceVisual() {
  return <div className="science-perspective"><div className="science-atom">
    {[1, 2, 3].map(index => <div className={`science-plane science-plane-${index}`} key={index}>
      <div className={`science-ring science-ring-${index}`}><span className="science-electron" /></div>
    </div>)}
    <span className="science-nucleus" />
  </div></div>
}

function VisualSvg({ children }) {
  return <svg className="track-illustration" viewBox="0 0 320 320" focusable="false">{children}</svg>
}

function TechnologyVisual() {
  const paths = ['M40 70H120V150H260', 'M60 260V210H180V80H270', 'M40 150H80V110H240V250']
  return <VisualSvg>
    {paths.map((path, index) => <g key={path}><path className="circuit-wire" d={path} /><path className={`circuit-pulse circuit-pulse-${index}`} d={path} pathLength="100" /></g>)}
    {[[40,70],[260,150],[60,260],[270,80],[40,150],[240,250],[120,150],[180,210]].map(([x,y], index) => <circle className="circuit-node" style={{ animationDelay: `${index * -2}s` }} key={`${x}-${y}`} cx={x} cy={y} r="7" />)}
  </VisualSvg>
}

function Gear({ x, y, radius, teeth, reverse = false }) {
  const points = Array.from({ length: teeth * 4 }, (_, index) => {
    const angle = index * Math.PI * 2 / (teeth * 4)
    const r = index % 4 === 1 || index % 4 === 2 ? radius : radius - 8
    return `${Math.cos(angle) * r},${Math.sin(angle) * r}`
  }).join(' ')
  return <g transform={`translate(${x} ${y})`}><g className={`mechanical-gear${reverse ? ' mechanical-gear-reverse' : ''}`}>
    <polygon points={points} /><circle r={radius * 0.55} /><circle className="gear-hub" r="9" />
    {[0,120,240].map(angle => <path key={angle} transform={`rotate(${angle})`} d={`M15 0H${radius * 0.48}`} />)}
  </g></g>
}

function EngineeringVisual() {
  return <VisualSvg><path className="blueprint-lines" d="M25 40H295M25 280H295M40 25V295M280 25V295M25 35V45M295 35V45" />
    <Gear x={108} y={111} radius={58} teeth={12} />
    <Gear x={214} y={111} radius={58} teeth={12} reverse />
    <Gear x={214} y={217} radius={58} teeth={12} />
  </VisualSvg>
}

function ArtVisual() {
  return <VisualSvg>
    <rect className="art-swatch art-swatch-purple" x="55" y="55" width="95" height="140" rx="12" />
    <circle className="art-swatch art-swatch-pink" cx="217" cy="107" r="43" />
    <path className="art-brush" d="M65 244C95 154 154 265 183 189S242 175 261 224" pathLength="100" />
    <path className="art-brush art-brush-fine" d="M62 217C105 128 139 234 204 169" pathLength="100" />
    <path className="art-shape" d="M182 53L203 31L224 53L203 75Z" />
  </VisualSvg>
}

function MathematicsVisual() {
  return <VisualSvg><path className="math-grid" d="M60 40V280M110 40V280M160 40V280M210 40V280M260 40V280M40 60H280M40 110H280M40 160H280M40 210H280M40 260H280" />
    <path className="math-axes" d="M40 40V280H280" />
    <path className="math-graph" d="M45 240C85 240 85 175 125 175S165 85 205 85S245 55 275 55" pathLength="100" />
    <g className="math-shape"><path d="M173 183L223 183L248 226L198 226Z" /><circle cx="211" cy="205" r="40" /></g>
    <text x="70" y="100">π</text><text x="252" y="151">∞</text>
  </VisualSvg>
}

function NeutralVisual() {
  return <VisualSvg><circle className="neutral-shape" cx="160" cy="160" r="93" /><path className="neutral-shape" d="M160 67L253 160L160 253L67 160Z" /><circle className="neutral-center" cx="160" cy="160" r="24" /></VisualSvg>
}

const visuals = { science: ScienceVisual, technology: TechnologyVisual, engineering: EngineeringVisual, art: ArtVisual, mathematics: MathematicsVisual, neutral: NeutralVisual }

export default function TrackVisual({ track }) {
  const treatment = trackTreatment(track)
  const Illustration = visuals[treatment]
  return <div className="track-visual-panel" aria-hidden="true" data-illustration={trackIllustrations[treatment]}>
    <div className="track-visual-stage" key={treatment}><Illustration /></div>
  </div>
}
