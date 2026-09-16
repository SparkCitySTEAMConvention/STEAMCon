export default function EmptyState({ title, children }) {
  return <div className="portal-empty"><h3>{title}</h3><p>{children}</p></div>
}
