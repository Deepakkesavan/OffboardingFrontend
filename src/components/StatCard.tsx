import './StatCard.css';

interface StatCardProps {
  label: string;
  value: number | string;
  color?: string;
  icon?: string;
  note?: string | null;
}

export default function StatCard({ label, value, color, icon, note }: StatCardProps) {
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