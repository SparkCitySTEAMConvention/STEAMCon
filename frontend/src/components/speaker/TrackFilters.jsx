export default function TrackFilters({ value, onChange, options = [] }) {
  return <fieldset className="portal-filters"><legend>Filter proposals by track</legend>
    {[{ id: 'all', name: 'All' }, ...options].map(track => <button type="button" key={track.id} aria-pressed={value === track.id} onClick={() => onChange(track.id)}>{track.name}</button>)}
  </fieldset>
}
