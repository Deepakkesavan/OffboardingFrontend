import './StatCard.css';

export default function StatCard({ label, value, color, icon, note }) {
  return (
    <div className="stat-card-wrap">
      <div className="stat-card-top">
        {icon && <span className="stat-card-icon">{icon}</span>}
        <span className="stat-card-label">{label}</span>
      </div>
      <div className="stat-card-value" style={color ? { color } : undefined}>
        {value}
      </div>
      {note && <div className="stat-card-note">{note}</div>}
    </div>
  );
}