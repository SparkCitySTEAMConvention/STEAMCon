export default function ItineraryItem({ item, index }) {
  return (
    <li className="attendee-itinerary-item">
      <span className="attendee-itinerary-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <div>
        <p className="eyebrow">{item.type || item.track}</p>
        <h3>{item.title}</h3>
        <p>{item.day} · {item.time}</p>
      </div>
      <span className="attendee-itinerary-location">{item.location}</span>
    </li>
  )
}
