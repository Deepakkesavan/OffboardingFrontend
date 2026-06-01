import './Badge.css';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
}

const VARIANT_MAP: Record<BadgeVariant, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  info:    'badge-info',
  primary: 'badge-primary',
  neutral: 'badge-neutral',
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  success: '#0e7c4a',
  warning: '#b45309',
  danger:  '#c0392b',
  info:    '#0369a1',
  primary: '#1a56db',
  neutral: '#9ca3af',
};

export default function Badge({ variant = 'neutral', dot = false, children }: BadgeProps) {
  const cls = VARIANT_MAP[variant] ?? 'badge-neutral';

  return (
    <span className={`badge ${cls}`}>
      {dot && (
        <span
          className="badge-dot"
          style={{ background: DOT_COLORS[variant] ?? DOT_COLORS.neutral }}
        />
      )}
      {children}
    </span>
  );
}