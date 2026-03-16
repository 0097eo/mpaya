const MAP = {
  pending:     { label: 'Pending',     cls: 'badge-pending' },
  in_progress: { label: 'In Progress', cls: 'badge-in_progress' },
  resolved:    { label: 'Resolved',    cls: 'badge-resolved' },
}

export default function StatusBadge({ status }) {
  const { label, cls } = MAP[status] || { label: status, cls: '' }
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {label}
    </span>
  )
}
